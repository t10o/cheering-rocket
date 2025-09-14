import { type Event } from "../types";

import { type UpdateEventData } from "./updateEvent";

/**
 * イベントデータを編集フォーム用に変換する
 * @param event イベントデータ
 * @returns 編集フォーム用のデータ
 */
export const convertEventToFormData = (event: Event): UpdateEventData => {
  const plannedAt = event.plannedAt;
  let date = "";
  let time = "";

  if (plannedAt) {
    const dateObj = plannedAt instanceof Date ? plannedAt : plannedAt.toDate();
    if (dateObj) {
      const isoString = dateObj.toISOString();
      if (isoString) {
        const datePart = isoString.split("T")[0];
        if (datePart) {
          date = datePart;
        }
      }
      const timeString = dateObj.toTimeString();
      if (timeString) {
        time = timeString.slice(0, 5);
      }
    }
  }

  return {
    name: event.name || "",
    date,
    time,
    note: event.note || "",
  };
};
