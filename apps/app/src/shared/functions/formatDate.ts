/**
 * 日付をフォーマットする関数
 */

import { type Timestamp } from "firebase/firestore";

export const formatDate = (
  timestamp: Date | Timestamp | null | undefined,
): string => {
  if (!timestamp) return "日付不明";

  // Date オブジェクトの場合
  if (timestamp instanceof Date) {
    return timestamp.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  // Firestore Timestamp の場合
  if (timestamp && typeof timestamp.toDate === "function") {
    return timestamp.toDate().toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  return "日付不明";
};

export const formatDateTime = (
  timestamp: Date | Timestamp | null | undefined,
): string => {
  if (!timestamp) return "日時未設定";

  // Date オブジェクトの場合
  if (timestamp instanceof Date) {
    return timestamp.toLocaleString("ja-JP", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  // Firestore Timestamp の場合
  if (timestamp && typeof timestamp.toDate === "function") {
    return timestamp.toDate().toLocaleString("ja-JP", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return "日時未設定";
};
