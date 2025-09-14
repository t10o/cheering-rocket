import { describe, expect, it, vi } from "vitest";

import { handleNameChange, handleSave } from "./profileForm";

describe("profileForm", () => {
  describe("handleNameChange", () => {
    it("新しい名前でフォームデータを更新する", () => {
      const setFormData = vi.fn();
      const newName = "New Name";

      handleNameChange(newName, setFormData);

      expect(setFormData).toHaveBeenCalledWith(expect.any(Function));
    });
  });

  describe("handleSave", () => {
    it("saveProfileを呼び出して成功を処理する", async () => {
      const mockSaveProfile = vi.fn().mockResolvedValue(true);
      const setToast = vi.fn();

      const formData = {
        name: "Test Name",
        photoURL: "https://example.com/photo.jpg",
        pendingAvatarFile: null,
        pendingPreviewURL: null,
      };

      await handleSave(formData, mockSaveProfile, setToast);

      expect(mockSaveProfile).toHaveBeenCalledWith(formData);
      expect(setToast).toHaveBeenCalledWith("保存に成功しました");
    });

    it("保存に失敗した場合にsetToastを呼び出さない", async () => {
      const mockSaveProfile = vi.fn().mockResolvedValue(false);
      const setToast = vi.fn();

      const formData = {
        name: "Test Name",
        photoURL: "https://example.com/photo.jpg",
        pendingAvatarFile: null,
        pendingPreviewURL: null,
      };

      await handleSave(formData, mockSaveProfile, setToast);

      expect(mockSaveProfile).toHaveBeenCalledWith(formData);
      expect(setToast).not.toHaveBeenCalled();
    });

    it("名前が空の場合にsaveProfileを呼び出さない", async () => {
      const mockSaveProfile = vi.fn();
      const setToast = vi.fn();

      const formData = {
        name: "",
        photoURL: "https://example.com/photo.jpg",
        pendingAvatarFile: null,
        pendingPreviewURL: null,
      };

      await handleSave(formData, mockSaveProfile, setToast);

      expect(mockSaveProfile).not.toHaveBeenCalled();
      expect(setToast).not.toHaveBeenCalled();
    });
  });
});
