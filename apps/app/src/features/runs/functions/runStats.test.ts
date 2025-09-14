import { describe, it, expect } from "vitest";
import { formatStatsPace, formatStatsDistance } from "./runStats";

describe("runStats", () => {
  describe("formatStatsPace", () => {
    it("ペースを正しくフォーマットする", () => {
      expect(formatStatsPace(5.5)).toBe("5:30/km");
    });

    it("ゼロのペースを処理する", () => {
      expect(formatStatsPace(0)).toBe("-");
    });

    it("一桁秒のペースを処理する", () => {
      expect(formatStatsPace(4.1)).toBe("4:06/km");
    });

    it("二桁秒のペースを処理する", () => {
      expect(formatStatsPace(6.25)).toBe("6:15/km");
    });
  });

  describe("formatStatsDistance", () => {
    it("1km未満の距離をメートルでフォーマットする", () => {
      expect(formatStatsDistance(0.5)).toBe("500m");
    });

    it("1km以上の距離をキロメートルでフォーマットする", () => {
      expect(formatStatsDistance(1.0)).toBe("1.0km");
    });

    it("小数点第1位で距離をフォーマットする", () => {
      expect(formatStatsDistance(5.25)).toBe("5.3km");
    });

    it("ゼロの距離を処理する", () => {
      expect(formatStatsDistance(0)).toBe("0m");
    });

    it("非常に小さい距離を処理する", () => {
      expect(formatStatsDistance(0.001)).toBe("1m");
    });
  });
});
