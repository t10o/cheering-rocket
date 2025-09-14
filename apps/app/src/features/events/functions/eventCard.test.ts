import type { Timestamp } from "firebase/firestore";
import { describe, expect, it } from "vitest";

import { formatEventDate } from "./eventCard";

describe("eventCard", () => {
  describe("formatEventDate", () => {
    it("タイムスタンプを正しくフォーマットする", () => {
      const mockTimestamp = {
        toDate: () => new Date("2025-11-09T17:20:00+09:00"), // JST時刻を直接指定
      } as unknown as Date | Timestamp;

      const result = formatEventDate(mockTimestamp);
      // タイムゾーンに依存しないテスト - 日付部分のみチェック
      expect(result).toMatch(/2025年11月9日/);
      expect(result).toMatch(/17:20|08:20/); // JSTまたはUTC時刻のいずれか
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
      const mockTimestamp = { someProperty: "value" } as unknown as
        | Date
        | Timestamp;
      const result = formatEventDate(mockTimestamp);
      expect(result).toBe("日時未設定");
    });
  });
});
