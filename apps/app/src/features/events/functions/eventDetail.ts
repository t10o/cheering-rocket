import {
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  query,
  where,
  documentId,
} from "firebase/firestore";
import { firebaseApp } from "@/libs/firebase";

export type Event = {
  name: string;
  plannedAt?: any;
  note?: string;
  ownerUid: string;
  joinable?: boolean;
};

export type MemberView = {
  uid: string;
  role: string;
  name?: string;
};

export const fetchEventDetail = async (eventId: string) => {
  const db = getFirestore(firebaseApp);

  // イベント本体
  const eventDoc = await getDoc(doc(db, "events", eventId));
  const eventData = eventDoc.data() as Event | undefined;
  if (!eventData) throw new Error("イベントが存在しません");

  // メンバー一覧
  const membersSnapshot = await getDocs(
    collection(db, "events", eventId, "members"),
  );
  const baseMembers = membersSnapshot.docs.map((d) => ({
    uid: d.id,
    role: (d.data() as any)?.role ?? "member",
  }));

  // users から名前をまとめ取得（最大10件ずつ）
  const uids = baseMembers.map((m) => m.uid);
  const nameMap = new Map<string, string | undefined>();
  for (let i = 0; i < uids.length; i += 10) {
    const chunk = uids.slice(i, i + 10);
    const userQuery = query(
      collection(db, "users"),
      where(documentId(), "in", chunk),
    );
    const userSnapshot = await getDocs(userQuery);
    userSnapshot.docs.forEach((u) =>
      nameMap.set(u.id, (u.data() as any)?.name ?? ""),
    );
  }

  const membersWithNames = baseMembers.map((m) => ({
    ...m,
    name: nameMap.get(m.uid) || "",
  }));

  // 役割順でソート
  const roleOrder = { owner: 0, admin: 1, member: 2 } as Record<string, number>;
  membersWithNames.sort((a, b) => {
    const orderA = roleOrder[a.role] ?? 99;
    const orderB = roleOrder[b.role] ?? 99;
    if (orderA !== orderB) return orderA - orderB;
    return (a.name || a.uid).localeCompare(b.name || b.uid);
  });

  return {
    event: eventData,
    members: membersWithNames,
  };
};

export const generateCheerUrl = (eventId: string) => {
  return `${window.location.origin}/cheer/${eventId}`;
};

export const copyToClipboard = async (text: string) => {
  await navigator.clipboard.writeText(text);
};
