import { describe, expect,it } from "vitest";

import { formatDate, formatDateTime } from "./formatDate";

describe("formatDate", () => {
  describe("formatDate", () => {
    it("タイムスタンプを正しくフォーマットする", () => {
      const mockTimestamp = {
        toDate: () => new Date("2025-11-09T08:20:00Z"),
      };

      const result = formatDate(mockTimestamp);
      expect(result).toBe("2025年11月9日"); // JST timezone with Japanese format
    });

    it("undefinedのタイムスタンプを処理する", () => {
      const result = formatDate(undefined);
      expect(result).toBe("日付不明");
    });

    it("nullのタイムスタンプを処理する", () => {
      const result = formatDate(null);
      expect(result).toBe("日付不明");
    });

    it("toDateメソッドがないタイムスタンプを処理する", () => {
      const mockTimestamp = { someProperty: "value" };
      const result = formatDate(mockTimestamp);
      expect(result).toBe("日付不明");
    });

    it("toDateがnullのタイムスタンプを処理する", () => {
      const mockTimestamp = { toDate: null };
      const result = formatDate(mockTimestamp);
      expect(result).toBe("日付不明");
    });
  });

  describe("formatDateTime", () => {
    it("タイムスタンプを正しくフォーマットする", () => {
      const mockTimestamp = {
        toDate: () => new Date("2025-11-09T08:20:00Z"),
      };

      const result = formatDateTime(mockTimestamp);
      expect(result).toBe("2025年11月9日 17:20"); // JST timezone with Japanese format
    });

    it("undefinedのタイムスタンプを処理する", () => {
      const result = formatDateTime(undefined);
      expect(result).toBe("日時未設定");
    });

    it("nullのタイムスタンプを処理する", () => {
      const result = formatDateTime(null);
      expect(result).toBe("日時未設定");
    });

    it("toDateメソッドがないタイムスタンプを処理する", () => {
      const mockTimestamp = { someProperty: "value" };
      const result = formatDateTime(mockTimestamp);
      expect(result).toBe("日時未設定");
    });

    it("toDateがnullのタイムスタンプを処理する", () => {
      const mockTimestamp = { toDate: null };
      const result = formatDateTime(mockTimestamp);
      expect(result).toBe("日時未設定");
    });
  });
});
