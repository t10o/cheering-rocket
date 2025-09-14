import {
  addDoc,
  collection,
  doc,
  getFirestore,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { firebaseApp } from "@/libs/firebase";
import {
  validateEventData,
  normalizeEventData,
  toTimestamp,
  type CreateEventData,
} from "./eventValidation";

export const createEvent = async (data: CreateEventData, userUid: string) => {
  const db = getFirestore(firebaseApp);

  // バリデーション
  validateEventData(data);

  // データ正規化
  const normalizedData = normalizeEventData(data);
  const plannedAt = new Date(
    toTimestamp(normalizedData.date, normalizedData.time),
  );

  // 1) イベント作成
  const eventRef = await addDoc(collection(db, "events"), {
    name: normalizedData.name,
    plannedAt,
    note: normalizedData.note,
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

export type { CreateEventData };
