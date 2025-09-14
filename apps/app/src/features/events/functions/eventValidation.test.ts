import { describe, expect,it } from "vitest";

import {
  type CreateEventData,
  type EventLite,
  getEventJoinErrorMessage,
  isEventJoinable,
  normalizeEventData,
  toTimestamp,
  validateEventData,
} from "./eventValidation";

describe("eventValidation", () => {
  describe("validateEventData", () => {
    it("有効なデータでエラーを投げない", () => {
      const validData: CreateEventData = {
        name: "Test Event",
        date: "2025-11-09",
        time: "10:00",
        note: "Test note",
      };

      expect(() => validateEventData(validData)).not.toThrow();
    });

    it("名前が空の場合にエラーを投げる", () => {
      const invalidData: CreateEventData = {
        name: "",
        date: "2025-11-09",
        time: "10:00",
        note: "Test note",
      };

      expect(() => validateEventData(invalidData)).toThrow(
        "イベント名を入力してください",
      );
    });

    it("名前が空白のみの場合にエラーを投げる", () => {
      const invalidData: CreateEventData = {
        name: "   ",
        date: "2025-11-09",
        time: "10:00",
        note: "Test note",
      };

      expect(() => validateEventData(invalidData)).toThrow(
        "イベント名を入力してください",
      );
    });

    it("日付が空の場合にエラーを投げる", () => {
      const invalidData: CreateEventData = {
        name: "Test Event",
        date: "",
        time: "10:00",
        note: "Test note",
      };

      expect(() => validateEventData(invalidData)).toThrow(
        "予定日を入力してください",
      );
    });
  });

  describe("normalizeEventData", () => {
    it("名前とノートをトリムする", () => {
      const data: CreateEventData = {
        name: "  Test Event  ",
        date: "2025-11-09",
        time: "10:00",
        note: "  Test note  ",
      };

      const result = normalizeEventData(data);

      expect(result).toEqual({
        name: "Test Event",
        date: "2025-11-09",
        time: "10:00",
        note: "Test note",
      });
    });

    it("他のフィールドを保持する", () => {
      const data: CreateEventData = {
        name: "Test Event",
        date: "2025-11-09",
        time: "10:00",
        note: "Test note",
      };

      const result = normalizeEventData(data);

      expect(result).toEqual(data);
    });
  });

  describe("toTimestamp", () => {
    it("日付と時刻を組み合わせる", () => {
      const result = toTimestamp("2025-11-09", "10:00");
      expect(result).toBe("2025-11-09T10:00");
    });

    it("時刻が空の場合にデフォルト時刻を使用する", () => {
      const result = toTimestamp("2025-11-09", "");
      expect(result).toBe("2025-11-09T00:00");
    });

    it("時刻がundefinedの場合にデフォルト時刻を使用する", () => {
      const result = toTimestamp("2025-11-09");
      expect(result).toBe("2025-11-09T00:00");
    });
  });

  describe("isEventJoinable", () => {
    it("参加可能なイベントでtrueを返す", () => {
      const eventData: EventLite = {
        name: "Test Event",
        ownerUid: "user123",
        joinable: true,
      };

      expect(isEventJoinable(eventData)).toBe(true);
    });

    it("joinableがundefinedの場合にtrueを返す", () => {
      const eventData: EventLite = {
        name: "Test Event",
        ownerUid: "user123",
      };

      expect(isEventJoinable(eventData)).toBe(true);
    });

    it("joinableがfalseの場合にfalseを返す", () => {
      const eventData: EventLite = {
        name: "Test Event",
        ownerUid: "user123",
        joinable: false,
      };

      expect(isEventJoinable(eventData)).toBe(false);
    });

    it("eventDataがundefinedの場合にfalseを返す", () => {
      expect(isEventJoinable(undefined)).toBe(false);
    });
  });

  describe("getEventJoinErrorMessage", () => {
    it("undefinedイベントのエラーメッセージを返す", () => {
      const message = getEventJoinErrorMessage(undefined);
      expect(message).toBe(
        "イベントが見つからないか、参加受付が無効になっています。",
      );
    });

    it("参加不可能なイベントのエラーメッセージを返す", () => {
      const eventData: EventLite = {
        name: "Test Event",
        ownerUid: "user123",
        joinable: false,
      };

      const message = getEventJoinErrorMessage(eventData);
      expect(message).toBe(
        "イベントが見つからないか、参加受付が無効になっています。",
      );
    });

    it("参加可能なイベントのエラーメッセージを返す", () => {
      const eventData: EventLite = {
        name: "Test Event",
        ownerUid: "user123",
        joinable: true,
      };

      const message = getEventJoinErrorMessage(eventData);
      expect(message).toBe(
        "イベントが見つからないか、参加受付が無効になっています。",
      );
    });
  });
});
