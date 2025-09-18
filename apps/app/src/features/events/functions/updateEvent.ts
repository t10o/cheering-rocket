import {
  doc,
  getFirestore,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import {
  type CreateEventData,
  normalizeEventData,
  toTimestamp,
  validateEventData,
} from "./eventValidation";

import { firebaseApp } from "@/libs/firebase";

export type UpdateEventData = CreateEventData;

/**
 * イベントを更新する
 * @param eventId イベントID
 * @param data 更新データ
 * @param userUid 更新者のUID
 * @throws {Error} 権限エラーまたはバリデーションエラー
 */
export const updateEvent = async (
  eventId: string,
  data: UpdateEventData,
  userUid: string,
) => {
  const db = getFirestore(firebaseApp);

  // バリデーション
  validateEventData(data);

  // データ正規化
  const normalizedData = normalizeEventData(data);
  const plannedAt = new Date(
    toTimestamp(normalizedData.date, normalizedData.time),
  );

  // イベント更新
  const eventRef = doc(db, "events", eventId);
  await updateDoc(eventRef, {
    name: normalizedData.name,
    plannedAt,
    note: normalizedData.note,
    updatedBy: userUid,
    updatedAt: serverTimestamp(),
  });

  return eventId;
};
