import * as Sentry from "@sentry/react";
import {
  collection,
  doc,
  documentId,
  getDoc,
  getDocs,
  getFirestore,
  query,
  where,
} from "firebase/firestore";

import { type Event } from "../types";

import { firebaseApp } from "@/libs/firebase";

export type MemberView = {
  uid: string;
  role: string;
  name?: string;
  photoUrl?: string | undefined;
};

export const fetchEventDetail = async (eventId: string) => {
  const db = getFirestore(firebaseApp);

  // イベント本体
  const eventDoc = await getDoc(doc(db, "events", eventId));
  const eventData = eventDoc.data() as Omit<Event, "id"> | undefined;
  if (!eventData) throw new Error("イベントが存在しません");

  // メンバー一覧
  const membersSnapshot = await getDocs(
    collection(db, "events", eventId, "members"),
  );
  const baseMembers = membersSnapshot.docs.map((d) => ({
    uid: d.id,
    role: (d.data() as { role?: string })?.role ?? "member",
  }));

  // users から名前と写真URLをまとめ取得（最大10件ずつ）
  const uids = baseMembers.map((m) => m.uid);
  const userDataMap = new Map<string, { name?: string; photoUrl?: string }>();
  for (let i = 0; i < uids.length; i += 10) {
    const chunk = uids.slice(i, i + 10);
    const userQuery = query(
      collection(db, "users"),
      where(documentId(), "in", chunk),
    );
    const userSnapshot = await getDocs(userQuery);
    userSnapshot.docs.forEach((u) => {
      const userData = u.data() as { name?: string; photoUrl?: string };
      userDataMap.set(u.id, {
        name: userData?.name ?? "",
        ...(userData?.photoUrl && { photoUrl: userData.photoUrl }),
      });
    });
  }

  const membersWithUserData = baseMembers.map((m) => {
    const userData = userDataMap.get(m.uid) || {};
    return {
      ...m,
      name: userData.name || "",
      photoUrl: userData.photoUrl,
    };
  });

  // 役割順でソート
  const roleOrder = { owner: 0, admin: 1, member: 2 } as Record<string, number>;
  membersWithUserData.sort((a, b) => {
    const orderA = roleOrder[a.role] ?? 99;
    const orderB = roleOrder[b.role] ?? 99;
    if (orderA !== orderB) return orderA - orderB;
    return (a.name || a.uid).localeCompare(b.name || b.uid);
  });

  return {
    event: {
      ...eventData,
      id: eventId,
    },
    members: membersWithUserData,
  };
};

export const generateCheerUrl = (eventId: string) => {
  return `${window.location.origin}/cheer/${eventId}`;
};

export const copyToClipboard = async (text: string) => {
  await navigator.clipboard.writeText(text);
};

// HEIC画像かどうかを判定する関数
export const isHeicImage = (url: string): boolean => {
  const lowerUrl = url.toLowerCase();
  // URLに拡張子が含まれている場合
  if (lowerUrl.includes(".heic") || lowerUrl.includes(".heif")) {
    return true;
  }

  // Firebase StorageのURLで、contentTypeがHEICの場合
  if (lowerUrl.includes("firebasestorage.googleapis.com")) {
    // URLパラメータからcontentTypeを確認
    try {
      const urlObj = new URL(url);
      const contentType = urlObj.searchParams.get("contentType");
      if (contentType && contentType.toLowerCase().includes("heic")) {
        return true;
      }
    } catch (error) {
      // URL解析エラーの場合は拡張子のみで判定
      console.warn("URL解析エラー:", error);
      Sentry.captureException(error);
    }
  }

  return false;
};
