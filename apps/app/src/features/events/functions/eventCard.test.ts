import { describe, it, expect } from "vitest";
import { formatEventDate } from "./eventCard";

describe("eventCard", () => {
  describe("formatEventDate", () => {
    it("タイムスタンプを正しくフォーマットする", () => {
      const mockTimestamp = {
        toDate: () => new Date("2025-11-09T08:20:00Z"),
      };

      const result = formatEventDate(mockTimestamp);
      expect(result).toBe("2025年11月9日 17:20"); // JST timezone with Japanese format
    });

    it("undefinedのタイムスタンプを処理する", () => {
      const result = formatEventDate(undefined);
      expect(result).toBe("日時未設定");
    });

    it("nullのタイムスタンプを処理する", () => {
      const result = formatEventDate(null);
      expect(result).toBe("日時未設定");
    });

    it("toDateメソッドがないタイムスタンプを処理する", () => {
      const mockTimestamp = { someProperty: "value" };
      const result = formatEventDate(mockTimestamp);
      expect(result).toBe("日時未設定");
    });
  });
});
