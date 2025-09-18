import type { LocationPoint } from "../types";

const EARTH_RADIUS_METERS = 6_371_000;
const MAX_SEGMENT_DISTANCE_METERS = 400; // ランナーが短時間で移動し得ない距離を除外
const MAX_ACCEPTABLE_ACCURACY_METERS = 75;

const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

const haversine = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number => {
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_METERS * c;
};

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

export const calculateSegmentDistanceMeters = (
  prev: Pick<LocationPoint, "latitude" | "longitude" | "accuracy">,
  curr: Pick<LocationPoint, "latitude" | "longitude" | "accuracy">,
): number => {
  if (!prev || !curr) return 0;

  if (
    !isFiniteNumber(prev.latitude) ||
    !isFiniteNumber(prev.longitude) ||
    !isFiniteNumber(curr.latitude) ||
    !isFiniteNumber(curr.longitude)
  ) {
    return 0;
  }

  if (
    prev.latitude === curr.latitude && prev.longitude === curr.longitude
  ) {
    return 0;
  }

  const distance = haversine(
    prev.latitude,
    prev.longitude,
    curr.latitude,
    curr.longitude,
  );

  const accuracy = Math.max(prev.accuracy ?? 0, curr.accuracy ?? 0);
  if (accuracy > 0 && accuracy > MAX_ACCEPTABLE_ACCURACY_METERS) {
    return 0;
  }

  if (distance > MAX_SEGMENT_DISTANCE_METERS) {
    return 0;
  }

  return distance;
};
