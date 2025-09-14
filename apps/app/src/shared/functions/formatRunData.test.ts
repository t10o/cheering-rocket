import { describe, it, expect } from "vitest";
import { formatPace, formatDistance, formatDuration } from "./formatRunData";

describe("formatRunData", () => {
  describe("formatPace", () => {
    it("ペースを正しくフォーマットする", () => {
      expect(formatPace(5.5)).toBe("5:30/km");
    });

    it("ゼロのペースを処理する", () => {
      expect(formatPace(0)).toBe("-");
    });

    it("一桁秒のペースを処理する", () => {
      expect(formatPace(4.1)).toBe("4:06/km");
    });

    it("二桁秒のペースを処理する", () => {
      expect(formatPace(6.25)).toBe("6:15/km");
    });

    it("ゼロ秒のペースを処理する", () => {
      expect(formatPace(5.0)).toBe("5:00/km");
    });

    it("59秒のペースを処理する", () => {
      expect(formatPace(5.99)).toBe("5:59/km");
    });
  });

  describe("formatDistance", () => {
    it("1km未満の距離をメートルでフォーマットする", () => {
      expect(formatDistance(0.5)).toBe("500m");
    });

    it("1km以上の距離をキロメートルでフォーマットする", () => {
      expect(formatDistance(1.0)).toBe("1.0km");
    });

    it("小数点第1位で距離をフォーマットする", () => {
      expect(formatDistance(5.25)).toBe("5.3km");
    });

    it("ゼロの距離を処理する", () => {
      expect(formatDistance(0)).toBe("0m");
    });

    it("非常に小さい距離を処理する", () => {
      expect(formatDistance(0.001)).toBe("1m");
    });

    it("ちょうど1kmの距離を処理する", () => {
      expect(formatDistance(1)).toBe("1.0km");
    });
  });

  describe("formatDuration", () => {
    it("1時間未満の時間を分のみでフォーマットする", () => {
      expect(formatDuration(30)).toBe("30分");
    });

    it("1時間以上の時間を時間と分でフォーマットする", () => {
      expect(formatDuration(90)).toBe("1時間30分");
    });

    it("ゼロの時間を処理する", () => {
      expect(formatDuration(0)).toBe("0分");
    });

    it("ちょうど1時間の時間を処理する", () => {
      expect(formatDuration(60)).toBe("1時間0分");
    });

    it("複数時間の時間を処理する", () => {
      expect(formatDuration(150)).toBe("2時間30分");
    });

    it("小数点分の時間を処理する", () => {
      expect(formatDuration(30.7)).toBe("31分");
    });

    it("小数点分を切り上げて時間を処理する", () => {
      expect(formatDuration(30.5)).toBe("31分");
    });
  });
});
