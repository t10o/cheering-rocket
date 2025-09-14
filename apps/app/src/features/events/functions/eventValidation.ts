import { type Timestamp } from "firebase/firestore";

export type CreateEventData = {
  name: string;
  date: string;
  time: string;
  note: string;
};

export type EventLite = {
  name: string;
  plannedAt?: Date | Timestamp;
  note?: string;
  ownerUid: string;
  joinable?: boolean;
};

/**
 * イベントデータのバリデーションを行う
 * @param data イベントデータ
 * @throws {Error} バリデーションエラー
 */
export const validateEventData = (data: CreateEventData): void => {
  if (!data.name.trim()) {
    throw new Error("イベント名を入力してください");
  }
  if (!data.date) {
    throw new Error("予定日を入力してください");
  }
};

/**
 * イベントデータを正規化する（前処理）
 * @param data イベントデータ
 * @returns 正規化されたイベントデータ
 */
export const normalizeEventData = (data: CreateEventData): CreateEventData => {
  return {
    name: data.name.trim(),
    date: data.date,
    time: data.time,
    note: data.note.trim(),
  };
};

/**
 * 日付と時刻を組み合わせてTimestamp用の文字列を作成する
 * @param date 日付文字列 (YYYY-MM-DD)
 * @param time 時刻文字列 (HH:MM) または空文字
 * @returns ISO形式の日時文字列
 */
export const toTimestamp = (date: string, time?: string): string => {
  // ローカル時刻のまま Timestamp に（必要ならTZ考慮ロジックを後で）
  const t = time && time.length ? `${date}T${time}` : `${date}T00:00`;
  return t;
};

/**
 * イベントが参加可能かどうかを判定する
 * @param eventData イベントデータ
 * @returns 参加可能な場合true
 */
export const isEventJoinable = (eventData: EventLite | undefined): boolean => {
  return eventData !== undefined && eventData.joinable !== false;
};

/**
 * イベント参加エラーメッセージを生成する
 * @param eventData イベントデータ
 * @returns エラーメッセージ
 */
export const getEventJoinErrorMessage = (
  eventData: EventLite | undefined,
): string => {
  if (!eventData) {
    return "イベントが見つからないか、参加受付が無効になっています。";
  }
  if (eventData.joinable === false) {
    return "イベントが見つからないか、参加受付が無効になっています。";
  }
  return "イベントが見つからないか、参加受付が無効になっています。";
};
