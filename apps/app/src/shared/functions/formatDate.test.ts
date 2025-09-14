import type { Timestamp } from "firebase/firestore";
import { describe, expect, it } from "vitest";

import { formatDate, formatDateTime } from "./formatDate";

describe("formatDate", () => {
  describe("formatDate", () => {
    it("タイムスタンプを正しくフォーマットする", () => {
      const mockTimestamp = {
        toDate: () => new Date("2025-11-09T17:20:00+09:00"), // JST時刻を直接指定
      } as unknown as Date | Timestamp;

      const result = formatDate(mockTimestamp);
      // タイムゾーンに依存しないテスト - 日付部分のみチェック
      expect(result).toMatch(/2025年11月9日/);
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
      const mockTimestamp = { someProperty: "value" } as unknown as
        | Date
        | Timestamp;
      const result = formatDate(mockTimestamp);
      expect(result).toBe("日付不明");
    });

    it("toDateがnullのタイムスタンプを処理する", () => {
      const mockTimestamp = { toDate: null } as unknown as Date | Timestamp;
      const result = formatDate(mockTimestamp);
      expect(result).toBe("日付不明");
    });
  });

  describe("formatDateTime", () => {
    it("タイムスタンプを正しくフォーマットする", () => {
      const mockTimestamp = {
        toDate: () => new Date("2025-11-09T17:20:00+09:00"), // JST時刻を直接指定
      } as unknown as Date | Timestamp;

      const result = formatDateTime(mockTimestamp);
      // タイムゾーンに依存しないテスト - 日付部分のみチェック
      expect(result).toMatch(/2025年11月9日/);
      expect(result).toMatch(/17:20|08:20/); // JSTまたはUTC時刻のいずれか
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
      const mockTimestamp = { someProperty: "value" } as unknown as
        | Date
        | Timestamp;
      const result = formatDateTime(mockTimestamp);
      expect(result).toBe("日時未設定");
    });

    it("toDateがnullのタイムスタンプを処理する", () => {
      const mockTimestamp = { toDate: null } as unknown as Date | Timestamp;
      const result = formatDateTime(mockTimestamp);
      expect(result).toBe("日時未設定");
    });
  });
});
