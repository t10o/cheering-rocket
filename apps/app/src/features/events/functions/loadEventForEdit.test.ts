import { Timestamp } from "firebase/firestore";
import { describe, expect, it } from "vitest";

import { type Event } from "../types";

import { convertEventToFormData } from "./loadEventForEdit";

describe("convertEventToFormData", () => {
  it("should convert event with plannedAt Date to form data", () => {
    const event: Event = {
      id: "test-event",
      name: "テストイベント",
      plannedAt: Timestamp.fromDate(new Date("2024-01-15T14:30:00")),
      note: "テスト備考",
      ownerUid: "test-uid",
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const result = convertEventToFormData(event);

    expect(result).toEqual({
      name: "テストイベント",
      date: "2024-01-15",
      time: "14:30",
      note: "テスト備考",
    });
  });

  it("should convert event with plannedAt Timestamp to form data", () => {
    const plannedAt = Timestamp.fromDate(new Date("2024-02-20T09:15:00"));
    const event: Event = {
      id: "test-event",
      name: "マラソンイベント",
      plannedAt,
      note: "マラソンの備考",
      ownerUid: "test-uid",
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const result = convertEventToFormData(event);

    expect(result).toEqual({
      name: "マラソンイベント",
      date: "2024-02-20",
      time: "09:15",
      note: "マラソンの備考",
    });
  });

  it("should handle event without plannedAt", () => {
    const event: Event = {
      id: "test-event",
      name: "日時未定イベント",
      note: "日時は後日決定",
      ownerUid: "test-uid",
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const result = convertEventToFormData(event);

    expect(result).toEqual({
      name: "日時未定イベント",
      date: "",
      time: "",
      note: "日時は後日決定",
    });
  });

  it("should handle event with empty strings", () => {
    const event: Event = {
      id: "test-event",
      name: "",
      note: "",
      ownerUid: "test-uid",
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const result = convertEventToFormData(event);

    expect(result).toEqual({
      name: "",
      date: "",
      time: "",
      note: "",
    });
  });

  it("should handle event with undefined values", () => {
    const event: Event = {
      id: "test-event",
      name: "テストイベント",
      ownerUid: "test-uid",
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const result = convertEventToFormData(event);

    expect(result).toEqual({
      name: "テストイベント",
      date: "",
      time: "",
      note: "",
    });
  });

  it("should handle time-only events (midnight)", () => {
    const event: Event = {
      id: "test-event",
      name: "深夜イベント",
      plannedAt: Timestamp.fromDate(new Date("2024-01-15T00:00:00Z")), // UTC時刻を指定
      note: "深夜のイベント",
      ownerUid: "test-uid",
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const result = convertEventToFormData(event);

    // タイムゾーンに依存しないテスト - 日付部分のみチェック
    expect(result.name).toBe("深夜イベント");
    expect(result.date).toMatch(/2024-01-1[45]/); // タイムゾーンによって1日ずれる可能性があるため
    expect(result.time).toMatch(/0[09]:00/); // タイムゾーンによって時刻が変わる可能性があるため
    expect(result.note).toBe("深夜のイベント");
  });

  it("should handle time-only events (end of day)", () => {
    const event: Event = {
      id: "test-event",
      name: "終日イベント",
      plannedAt: Timestamp.fromDate(new Date("2024-01-15T23:59:59")),
      note: "終日のイベント",
      ownerUid: "test-uid",
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const result = convertEventToFormData(event);

    expect(result).toEqual({
      name: "終日イベント",
      date: "2024-01-15",
      time: "23:59",
      note: "終日のイベント",
    });
  });
});
