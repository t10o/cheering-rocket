import type { Timestamp } from "firebase/firestore";
import { describe, expect, it } from "vitest";

import { formatRunDate, formatRunDuration, formatRunPace } from "./runCard";

describe("runCard", () => {
  describe("formatRunDate", () => {
    it("タイムスタンプを正しくフォーマットする", () => {
      const mockTimestamp = {
        toDate: () => new Date("2025-11-09T08:20:00Z"),
      } as unknown as Date | Timestamp;

      const result = formatRunDate(mockTimestamp);
      expect(result).toBe("2025年11月9日"); // JST timezone with Japanese format
    });

    it("undefinedのタイムスタンプを処理する", () => {
      const result = formatRunDate(undefined);
      expect(result).toBe("日付不明");
    });

    it("nullのタイムスタンプを処理する", () => {
      const result = formatRunDate(null);
      expect(result).toBe("日付不明");
    });

    it("toDateメソッドがないタイムスタンプを処理する", () => {
      const mockTimestamp = { someProperty: "value" } as unknown as
        | Date
        | Timestamp;
      const result = formatRunDate(mockTimestamp);
      expect(result).toBe("日付不明");
    });
  });

  describe("formatRunPace", () => {
    it("ペースを正しくフォーマットする", () => {
      expect(formatRunPace(5.5)).toBe("5:30/km");
    });

    it("ゼロのペースを処理する", () => {
      expect(formatRunPace(0)).toBe("-");
    });

    it("一桁秒のペースを処理する", () => {
      expect(formatRunPace(4.1)).toBe("4:06/km");
    });
  });

  describe("formatRunDuration", () => {
    it("1時間未満の時間を分のみでフォーマットする", () => {
      expect(formatRunDuration(30)).toBe("30分");
    });

    it("1時間以上の時間を時間と分でフォーマットする", () => {
      expect(formatRunDuration(90)).toBe("1時間30分");
    });

    it("ゼロの時間を処理する", () => {
      expect(formatRunDuration(0)).toBe("0分");
    });
  });
});
