import { initializeApp } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { getMessaging } from "firebase-admin/messaging";
import {
  onDocumentCreated,
  type FirestoreEvent,
  type QueryDocumentSnapshot,
} from "firebase-functions/v2/firestore";
import { HttpsError, onCall } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";

type RunStatus = "planned" | "active" | "completed" | "cancelled";

type RunDocument = {
  userId: string;
  eventId: string;
  status: RunStatus;
  updatedAt?: Timestamp;
  startedAt?: Timestamp;
  deviceToken?: string;
  distance?: number;
};

type LocationPointDocument = {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  speed?: number;
  heading?: number;
  timestamp?: Timestamp;
};

type UserDocument = {
  name?: string;
  photoUrl?: string;
};

type CheerMessageDocument = {
  eventId: string;
  runId?: string | null;
  senderId: string;
  senderName: string;
  senderType?: string;
  message: string;
  timestamp: Timestamp;
  isRead: boolean;
};

initializeApp();

const db = getFirestore();
const messaging = getMessaging();
const REGION = "asia-northeast1";
const MAX_LOCATION_POINTS = 120;
const MAX_MESSAGES = 100;
const MAX_MESSAGE_LENGTH = 280;

const toISOString = (timestamp?: Timestamp) =>
  timestamp ? timestamp.toDate().toISOString() : new Date().toISOString();

const haversineDistance = (a: LocationPointDocument, b: LocationPointDocument) => {
  const R = 6_371_000; // Earth radius in meters
  const toRad = (value: number) => (value * Math.PI) / 180;

  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);

  const h =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  return R * c;
};

const calculateTotalDistance = (points: LocationPointDocument[]) => {
  if (points.length < 2) return 0;
  let total = 0;
  for (let i = 1; i < points.length; i += 1) {
    total += haversineDistance(points[i - 1]!, points[i]!);
  }
  return total;
};

const sanitizeString = (value: unknown) =>
  typeof value === "string" ? value.trim() : "";

export const hello = onCall({ region: REGION }, (req) => {
  if (!req.auth) {
    throw new Error("Unauthenticated");
  }
  return { ok: true, uid: req.auth.uid, message: "Hello from Functions v2!" };
});

export const getCheerSession = onCall({ region: REGION }, async (request) => {
  const eventId = sanitizeString(request.data?.eventId);
  if (!eventId) {
    throw new HttpsError("invalid-argument", "eventId is required");
  }

  const eventSnap = await db.collection("events").doc(eventId).get();
  if (!eventSnap.exists) {
    throw new HttpsError("not-found", "イベントが見つかりません");
  }

  const eventData = eventSnap.data() as { name?: string } | undefined;

  const runsSnapshot = await db
    .collection("runs")
    .where("eventId", "==", eventId)
    .where("status", "==", "active")
    .get();

  const runnerSnapshots = await Promise.all(
    runsSnapshot.docs.map(async (runDoc) => {
      const runData = runDoc.data() as RunDocument;

      const [userSnap, locationSnapshot] = await Promise.all([
        db.collection("users").doc(runData.userId).get(),
        db
          .collection("locationPoints")
          .where("runId", "==", runDoc.id)
          .orderBy("timestamp", "asc")
          .limit(MAX_LOCATION_POINTS)
          .get(),
      ]);

      const userData = (userSnap.data() as UserDocument | undefined) ?? {};

      const locations = locationSnapshot.docs.map((locationDoc) => {
        const point = locationDoc.data() as LocationPointDocument;
        return {
          latitude: point.latitude,
          longitude: point.longitude,
          timestamp: toISOString(point.timestamp),
        };
      });

      const lastKnownLocation = locations.at(-1) ?? null;
      const totalDistanceMeters = calculateTotalDistance(
        locationSnapshot.docs.map((doc) => doc.data() as LocationPointDocument),
      );

      const updatedAt =
        toISOString(runData.updatedAt) ||
        lastKnownLocation?.timestamp ||
        new Date().toISOString();

      return {
        profile: {
          runId: runDoc.id,
          userId: runData.userId,
          displayName: userData.name || "ランナー",
          photoUrl: userData.photoUrl,
        },
        lastKnownLocation,
        path: locations,
        totalDistanceMeters,
        isActive: runData.status === "active",
        updatedAt,
      };
    }),
  );

  const messagesSnapshot = await db
    .collection("cheerMessages")
    .where("eventId", "==", eventId)
    .orderBy("timestamp", "desc")
    .limit(MAX_MESSAGES)
    .get();

  const messages = messagesSnapshot.docs
    .map((doc) => {
      const data = doc.data() as CheerMessageDocument;
      return {
        id: doc.id,
        runId: data.runId ?? undefined,
        senderName: data.senderName,
        senderType: data.senderType ?? "supporter",
        message: data.message,
        timestamp: toISOString(data.timestamp),
      };
    })
    .reverse();

  const now = new Date().toISOString();

  return {
    session: {
      eventId,
      eventName: eventData?.name ?? "イベント",
      runners: runnerSnapshots,
      messages,
      updatedAt: now,
    },
    cursor: now,
  };
});

export const postCheerMessage = onCall({ region: REGION }, async (request) => {
  const eventId = sanitizeString(request.data?.eventId);
  const runId = sanitizeString(request.data?.runId);
  const senderName = sanitizeString(request.data?.senderName);
  const message = sanitizeString(request.data?.message);

  if (!eventId) {
    throw new HttpsError("invalid-argument", "eventId is required");
  }
  if (!senderName) {
    throw new HttpsError("invalid-argument", "senderName is required");
  }
  if (!message) {
    throw new HttpsError("invalid-argument", "message is required");
  }
  if (message.length > MAX_MESSAGE_LENGTH) {
    throw new HttpsError("invalid-argument", "message is too long");
  }

  const eventSnap = await db.collection("events").doc(eventId).get();
  if (!eventSnap.exists) {
    throw new HttpsError("not-found", "イベントが見つかりません");
  }

  let runDocs;
  if (runId) {
    const runSnap = await db.collection("runs").doc(runId).get();
    if (!runSnap.exists) {
      throw new HttpsError("not-found", "対象のランが見つかりません");
    }
    const runData = runSnap.data() as RunDocument;
    if (runData.eventId !== eventId) {
      throw new HttpsError("invalid-argument", "イベントとランが一致しません");
    }
    runDocs = [runSnap];
  } else {
    const activeRunsSnap = await db
      .collection("runs")
      .where("eventId", "==", eventId)
      .where("status", "==", "active")
      .get();
    runDocs = activeRunsSnap.docs;
  }

  const timestamp = Timestamp.now();

  const messageDoc = await db.collection("cheerMessages").add({
    eventId,
    runId: runId || null,
    senderId: request.auth?.uid ?? "supporter-web",
    senderName,
    senderType: request.auth?.uid ? "runner" : "supporter",
    message,
    timestamp,
    isRead: false,
  });

  const deliveredTo: string[] = [];

  await Promise.all(
    runDocs.map(async (runSnap) => {
      const runData = runSnap.data() as RunDocument;
      const token = sanitizeString(runData.deviceToken);
      if (!token) return;

      try {
        await messaging.send({
          token,
          notification: {
            title: `${senderName}さんからの応援メッセージ`,
            body: message,
          },
          data: {
            eventId,
            runId: runSnap.id,
            type: "cheer",
          },
        });
        deliveredTo.push(runSnap.id);
      } catch (error) {
        logger.error("Failed to deliver push notification", {
          runId: runSnap.id,
          error,
        });
      }
    }),
  );

  return {
    messageId: messageDoc.id,
    deliveredTo,
  };
});

export const onUserCreated = onDocumentCreated(
  {
    region: REGION,
    document: "users/{uid}",
  },
  async (event: FirestoreEvent<QueryDocumentSnapshot | undefined, { uid: string }>) => {
    const uid = event.params.uid;
    logger.info("New user doc:", uid, event.data?.data());
  },
);
