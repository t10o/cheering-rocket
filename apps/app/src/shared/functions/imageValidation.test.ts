import { describe, it, expect } from "vitest";
import {
  isHeicFile,
  changeHeicExtensionToJpg,
  isValidConversionResult,
  getFirstBlob,
} from "./imageValidation";

describe("imageValidation", () => {
  describe("isHeicFile", () => {
    it("拡張子でHEICファイルに対してtrueを返す", () => {
      const heicFile = new File([""], "test.heic", { type: "image/jpeg" });
      expect(isHeicFile(heicFile)).toBe(true);
    });

    it("拡張子でHEIFファイルに対してtrueを返す", () => {
      const heifFile = new File([""], "test.heif", { type: "image/jpeg" });
      expect(isHeicFile(heifFile)).toBe(true);
    });

    it("MIMEタイプでHEICファイルに対してtrueを返す", () => {
      const heicFile = new File([""], "test.jpg", { type: "image/heic" });
      expect(isHeicFile(heicFile)).toBe(true);
    });

    it("MIMEタイプでHEIFファイルに対してtrueを返す", () => {
      const heifFile = new File([""], "test.jpg", { type: "image/heif" });
      expect(isHeicFile(heifFile)).toBe(true);
    });

    it("大文字拡張子のHEICファイルに対してtrueを返す", () => {
      const heicFile = new File([""], "test.HEIC", { type: "image/jpeg" });
      expect(isHeicFile(heicFile)).toBe(true);
    });

    it("大文字拡張子のHEIFファイルに対してtrueを返す", () => {
      const heifFile = new File([""], "test.HEIF", { type: "image/jpeg" });
      expect(isHeicFile(heifFile)).toBe(true);
    });

    it("大文字MIMEタイプのHEICファイルに対してtrueを返す", () => {
      const heicFile = new File([""], "test.jpg", { type: "IMAGE/HEIC" });
      expect(isHeicFile(heicFile)).toBe(true);
    });

    it("通常のJPEGファイルに対してfalseを返す", () => {
      const jpegFile = new File([""], "test.jpg", { type: "image/jpeg" });
      expect(isHeicFile(jpegFile)).toBe(false);
    });

    it("PNGファイルに対してfalseを返す", () => {
      const pngFile = new File([""], "test.png", { type: "image/png" });
      expect(isHeicFile(pngFile)).toBe(false);
    });

    it("拡張子がないファイルに対してfalseを返す", () => {
      const file = new File([""], "test", { type: "image/jpeg" });
      expect(isHeicFile(file)).toBe(false);
    });

    it("他の拡張子のファイルに対してfalseを返す", () => {
      const file = new File([""], "test.gif", { type: "image/gif" });
      expect(isHeicFile(file)).toBe(false);
    });
  });

  describe("changeHeicExtensionToJpg", () => {
    it(".heic拡張子を.jpgに変更する", () => {
      const result = changeHeicExtensionToJpg("test.heic");
      expect(result).toBe("test.jpg");
    });

    it(".heif拡張子を.jpgに変更する", () => {
      const result = changeHeicExtensionToJpg("test.heif");
      expect(result).toBe("test.jpg");
    });

    it("大文字拡張子を変更する", () => {
      const result = changeHeicExtensionToJpg("test.HEIC");
      expect(result).toBe("test.jpg");
    });

    it("他の拡張子は変更しない", () => {
      const result = changeHeicExtensionToJpg("test.jpg");
      expect(result).toBe("test.jpg");
    });

    it("拡張子がないファイルは変更しない", () => {
      const result = changeHeicExtensionToJpg("test");
      expect(result).toBe("test");
    });
  });

  describe("isValidConversionResult", () => {
    it("有効なblobに対してtrueを返す", () => {
      const blob = new Blob(["test"], { type: "image/jpeg" });
      expect(isValidConversionResult(blob)).toBe(true);
    });

    it("nullに対してfalseを返す", () => {
      expect(isValidConversionResult(null)).toBe(false);
    });

    it("undefinedに対してfalseを返す", () => {
      expect(isValidConversionResult(undefined)).toBe(false);
    });

    it("空文字列に対してtrueを返す", () => {
      expect(isValidConversionResult("")).toBe(true);
    });

    it("0に対してtrueを返す", () => {
      expect(isValidConversionResult(0)).toBe(true);
    });
  });

  describe("getFirstBlob", () => {
    it("配列から最初の要素を返す", () => {
      const blob1 = new Blob(["test1"], { type: "image/jpeg" });
      const blob2 = new Blob(["test2"], { type: "image/jpeg" });
      const result = getFirstBlob([blob1, blob2]);
      expect(result).toBe(blob1);
    });

    it("配列でない場合は同じ値を返す", () => {
      const blob = new Blob(["test"], { type: "image/jpeg" });
      const result = getFirstBlob(blob);
      expect(result).toBe(blob);
    });

    it("空配列に対してundefinedを返す", () => {
      const result = getFirstBlob([]);
      expect(result).toBeUndefined();
    });
  });
});
