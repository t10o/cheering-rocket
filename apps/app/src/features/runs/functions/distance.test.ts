import { describe, expect, it } from "vitest";

import { calculateSegmentDistanceMeters } from "./distance";

describe("calculateSegmentDistanceMeters", () => {
  it("returns distance for valid small movement", () => {
    const prev = { latitude: 35, longitude: 135, accuracy: 10 };
    const curr = { latitude: 35.0005, longitude: 135.0005, accuracy: 8 };
    const result = calculateSegmentDistanceMeters(prev, curr);
    expect(result).toBeGreaterThan(0);
    expect(result).toBeLessThan(200);
  });

  it("filters out unrealistic jump", () => {
    const prev = { latitude: 35, longitude: 135, accuracy: 10 };
    const curr = { latitude: 35.1, longitude: 135.1, accuracy: 9 };
    const result = calculateSegmentDistanceMeters(prev, curr);
    expect(result).toBe(0);
  });

  it("filters out low accuracy points", () => {
    const prev = { latitude: 35, longitude: 135, accuracy: 120 };
    const curr = { latitude: 35.0005, longitude: 135.0005, accuracy: 120 };
    const result = calculateSegmentDistanceMeters(prev, curr);
    expect(result).toBe(0);
  });
});
