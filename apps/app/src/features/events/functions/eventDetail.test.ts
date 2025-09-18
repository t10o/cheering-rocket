import { afterEach, describe, expect, it, vi } from "vitest";

import { copyToClipboard, generateCheerUrl, isHeicImage } from "./eventDetail";

describe("eventDetail", () => {
  describe("isHeicImage", () => {
    it("HEIC URLに対してtrueを返す", () => {
      expect(isHeicImage("https://example.com/image.heic")).toBe(true);
    });

    it("HEIF URLに対してtrueを返す", () => {
      expect(isHeicImage("https://example.com/image.heif")).toBe(true);
    });

    it("Firebase Storage HEIC URLに対してtrueを返す", () => {
      const firebaseUrl =
        "https://firebasestorage.googleapis.com/v0/b/test.appspot.com/o/image.heic?alt=media&token=123";
      expect(isHeicImage(firebaseUrl)).toBe(true);
    });

    it("HEIC contentTypeのFirebase Storage URLに対してtrueを返す", () => {
      const firebaseUrl =
        "https://firebasestorage.googleapis.com/v0/b/test.appspot.com/o/image.jpg?contentType=image%2Fheic&alt=media";
      expect(isHeicImage(firebaseUrl)).toBe(true);
    });

    it("通常のJPEG URLに対してfalseを返す", () => {
      expect(isHeicImage("https://example.com/image.jpg")).toBe(false);
    });

    it("PNG URLに対してfalseを返す", () => {
      expect(isHeicImage("https://example.com/image.png")).toBe(false);
    });

    it("Firebase Storage JPEG URLに対してfalseを返す", () => {
      const firebaseUrl =
        "https://firebasestorage.googleapis.com/v0/b/test.appspot.com/o/image.jpg?alt=media&token=123";
      expect(isHeicImage(firebaseUrl)).toBe(false);
    });
  });

  describe("generateCheerUrl", () => {
    const originalBaseUrl = import.meta.env.VITE_CHEER_WEB_BASE_URL;

    afterEach(() => {
      (import.meta.env as Record<string, string | undefined>).VITE_CHEER_WEB_BASE_URL =
        originalBaseUrl;
    });

    it("環境変数が未設定の場合はwindow.locationを使用する", () => {
      (import.meta.env as Record<string, string | undefined>).VITE_CHEER_WEB_BASE_URL =
        undefined;
      // Mock window.location.origin
      Object.defineProperty(window, "location", {
        value: {
          origin: "https://example.com",
        },
        writable: true,
      });

      const eventId = "test-event-123";
      const result = generateCheerUrl(eventId);
      expect(result).toBe("https://example.com/cheer/test-event-123");
    });

    it("環境変数が設定されていればそちらを優先する", () => {
      (import.meta.env as Record<string, string | undefined>).VITE_CHEER_WEB_BASE_URL =
        "https://cheer.example.com/";

      const eventId = "amazing-run";
      const result = generateCheerUrl(eventId);
      expect(result).toBe("https://cheer.example.com/cheer/amazing-run");
    });
  });

  describe("copyToClipboard", () => {
    it("navigator.clipboard.writeTextを呼び出す", async () => {
      const mockWriteText = vi.fn().mockResolvedValue(undefined);
      Object.assign(navigator, {
        clipboard: {
          writeText: mockWriteText,
        },
      });

      const text = "test text";
      await copyToClipboard(text);

      expect(mockWriteText).toHaveBeenCalledWith(text);
    });
  });
});
