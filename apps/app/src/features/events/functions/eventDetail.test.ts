import { describe, it, expect, vi } from "vitest";
import { isHeicImage, generateCheerUrl, copyToClipboard } from "./eventDetail";

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
    it("正しいcheer URLを生成する", () => {
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
