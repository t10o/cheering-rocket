/**
 * ランデータをフォーマットする関数
 */

export const formatPace = (pace: number): string => {
  if (pace === 0) return "-";
  const minutes = Math.floor(pace);
  const seconds = Math.round((pace - minutes) * 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}/km`;
};

export const formatDistance = (distance: number): string => {
  if (!Number.isFinite(distance) || distance <= 0) {
    return "0m";
  }

  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`;
  }

  const rounded = Number(distance.toFixed(3));
  return `${rounded}km`;
};

export const formatDuration = (duration: number): string => {
  const hours = Math.floor(duration / 60);
  const minutes = Math.round(duration % 60);
  if (hours > 0) {
    return `${hours}時間${minutes}分`;
  }
  return `${minutes}分`;
};
