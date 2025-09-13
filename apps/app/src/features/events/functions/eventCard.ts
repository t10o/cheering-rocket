import { formatDateTime } from "@/shared/functions/formatDate";

export const formatEventDate = (timestamp: any): string => {
  return formatDateTime(timestamp);
};
