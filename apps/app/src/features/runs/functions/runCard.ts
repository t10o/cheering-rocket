import { formatDate } from "@/shared/functions/formatDate";
import { formatDuration,formatPace } from "@/shared/functions/formatRunData";

export const formatRunDate = (timestamp: any): string => {
  return formatDate(timestamp);
};

export const formatRunPace = (pace: number): string => {
  return formatPace(pace);
};

export const formatRunDuration = (duration: number): string => {
  return formatDuration(duration);
};
