import { describe, it, expect } from "vitest";
import { getMenuItems } from "./menuItems";
import {
  faPersonRunning,
  faUser,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";

describe("menuItems", () => {
  describe("getMenuItems", () => {
    it("すべてのメニューアイテムを返す", () => {
      const menuItems = getMenuItems();
      expect(menuItems).toHaveLength(3);
    });

    it("プロフィールメニューアイテムを返す", () => {
      const menuItems = getMenuItems();
      const profileItem = menuItems.find((item) => item.to === "/profile");

      expect(profileItem).toBeDefined();
      expect(profileItem?.label).toBe("プロフィール");
      expect(profileItem?.icon).toBe(faUser);
      expect(profileItem?.description).toBe("アカウント設定とプロフィール管理");
    });

    it("イベントメニューアイテムを返す", () => {
      const menuItems = getMenuItems();
      const eventsItem = menuItems.find((item) => item.to === "/events");

      expect(eventsItem).toBeDefined();
      expect(eventsItem?.label).toBe("イベント管理");
      expect(eventsItem?.icon).toBe(faUsers);
      expect(eventsItem?.description).toBe("マラソンイベントの作成と参加");
    });

    it("ランメニューアイテムを返す", () => {
      const menuItems = getMenuItems();
      const runsItem = menuItems.find((item) => item.to === "/runs");

      expect(runsItem).toBeDefined();
      expect(runsItem?.label).toBe("ラン管理");
      expect(runsItem?.icon).toBe(faPersonRunning);
      expect(runsItem?.description).toBe("ランニング記録と分析");
    });

    it("正しい順序でメニューアイテムを返す", () => {
      const menuItems = getMenuItems();
      const expectedOrder = ["/profile", "/events", "/runs"];

      const actualOrder = menuItems.map((item) => item.to);
      expect(actualOrder).toEqual(expectedOrder);
    });

    it("すべてのアイテムで一貫した構造を持つ", () => {
      const menuItems = getMenuItems();

      menuItems.forEach((item) => {
        expect(item).toHaveProperty("to");
        expect(item).toHaveProperty("label");
        expect(item).toHaveProperty("icon");
        expect(item).toHaveProperty("description");

        expect(typeof item.to).toBe("string");
        expect(typeof item.label).toBe("string");
        expect(typeof item.description).toBe("string");
        expect(item.to).toMatch(/^\//); // Should start with /
      });
    });
  });
});
