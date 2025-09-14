import { formatDistance,formatPace } from "@/shared/functions/formatRunData";

export const formatStatsPace = (pace: number): string => {
  return formatPace(pace);
};

export const formatStatsDistance = (distance: number): string => {
  return formatDistance(distance);
};
