import {
  doc,
  getDoc,
  getFirestore,
  collection,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { firebaseApp } from "@/libs/firebase";

export type EventLite = {
  name: string;
  plannedAt?: any;
  note?: string;
  ownerUid: string;
  joinable?: boolean;
};

export const searchEvent = async (eventId: string) => {
  const db = getFirestore(firebaseApp);
  const eventDoc = await getDoc(doc(db, "events", eventId));
  const eventData = eventDoc.data() as EventLite | undefined;

  if (!eventData || eventData.joinable === false) {
    throw new Error("イベントが見つからないか、参加受付が無効になっています。");
  }

  return { id: eventDoc.id, data: eventData };
};

export const joinEvent = async (eventId: string, userUid: string) => {
  const db = getFirestore(firebaseApp);

  await setDoc(
    doc(collection(db, "events", eventId, "members"), userUid),
    {
      uid: userUid,
      role: "member",
      joinedAt: serverTimestamp(),
      inviterUid: userUid, // ID参加なので自分を招待者に
    },
    { merge: true },
  );
};
