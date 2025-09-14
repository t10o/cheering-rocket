import { type Event } from "../types";

/**
 * ユーザーがイベントの管理者かどうかを判定する
 * @param event イベントデータ
 * @param userUid ユーザーのUID
 * @returns 管理者の場合true
 */
export const isEventOwner = (event: Event, userUid: string): boolean => {
  return event.ownerUid === userUid;
};

/**
 * ユーザーがイベントを編集できるかどうかを判定する
 * @param event イベントデータ
 * @param userUid ユーザーのUID
 * @returns 編集可能な場合true
 */
export const canEditEvent = (event: Event, userUid: string): boolean => {
  return isEventOwner(event, userUid);
};
