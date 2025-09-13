/**
 * 日付をフォーマットする関数
 */

export const formatDate = (timestamp: any): string => {
  if (!timestamp?.toDate) return "日付不明";
  return timestamp.toDate().toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const formatDateTime = (timestamp: any): string => {
  if (!timestamp?.toDate) return "日時未設定";
  return timestamp.toDate().toLocaleString("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
