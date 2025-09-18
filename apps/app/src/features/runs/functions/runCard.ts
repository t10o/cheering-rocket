import { type Timestamp } from "firebase/firestore";

import { formatDate } from "@/shared/functions/formatDate";
import { formatDistance, formatDuration, formatPace } from "@/shared/functions/formatRunData";

export const formatRunDate = (
  timestamp: Date | Timestamp | null | undefined,
): string => {
  return formatDate(timestamp);
};

export const formatRunPace = (pace: number): string => {
  return formatPace(pace);
};

export const formatRunDuration = (duration: number): string => {
  return formatDuration(duration);
};

export const formatRunDistance = (distance: number): string => {
  return formatDistance(distance);
};
