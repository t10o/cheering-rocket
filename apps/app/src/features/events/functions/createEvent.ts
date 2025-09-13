import { getAuth } from "firebase/auth";
import {
  addDoc,
  collection,
  doc,
  getFirestore,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { firebaseApp } from "@/libs/firebase";

export type CreateEventData = {
  name: string;
  date: string;
  time: string;
  note: string;
};

export const createEvent = async (data: CreateEventData, userUid: string) => {
  const db = getFirestore(firebaseApp);

  if (!data.name.trim()) {
    throw new Error("イベント名を入力してください");
  }
  if (!data.date) {
    throw new Error("予定日を入力してください");
  }

  const plannedAt = toTimestamp(data.date, data.time);

  // 1) イベント作成
  const eventRef = await addDoc(collection(db, "events"), {
    name: data.name.trim(),
    plannedAt,
    note: data.note.trim(),
    ownerUid: userUid,
    joinable: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // 2) 作成者をオーナーとしてメンバー登録
  await setDoc(doc(db, "events", eventRef.id, "members", userUid), {
    uid: userUid, // ← 追加（CGクエリ用のフィールド）
    role: "owner",
    joinedAt: serverTimestamp(),
    inviterUid: userUid,
  });

  return eventRef.id;
};

function toTimestamp(date: string, time?: string) {
  // ローカル時刻のまま Timestamp に（必要ならTZ考慮ロジックを後で）
  const t = time && time.length ? `${date}T${time}` : `${date}T00:00`;
  return new Date(t);
}
