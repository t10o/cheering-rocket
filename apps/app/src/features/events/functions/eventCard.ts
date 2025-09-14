import { type Timestamp } from "firebase/firestore";

import { formatDateTime } from "@/shared/functions/formatDate";

export const formatEventDate = (
  timestamp: Date | Timestamp | null | undefined,
): string => {
  return formatDateTime(timestamp);
};
