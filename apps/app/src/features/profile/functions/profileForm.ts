import type { ProfileFormData } from "../types";

export const handleFileSelect = (
  file: File,
  setFormData: React.Dispatch<React.SetStateAction<ProfileFormData>>,
) => {
  // 古いプレビューURLを解放
  setFormData((prev) => {
    if (prev.pendingPreviewURL) {
      URL.revokeObjectURL(prev.pendingPreviewURL);
    }

    const preview = URL.createObjectURL(file);
    return {
      ...prev,
      pendingAvatarFile: file,
      pendingPreviewURL: preview,
    };
  });
};

export const handleNameChange = (
  value: string,
  setFormData: React.Dispatch<React.SetStateAction<ProfileFormData>>,
  setDirty: React.Dispatch<React.SetStateAction<boolean>>,
) => {
  setFormData((prev) => ({ ...prev, name: value }));
  setDirty(true);
};

export const handleSave = async (
  formData: ProfileFormData,
  saveProfile: (data: ProfileFormData) => Promise<boolean | undefined>,
  setDirty: React.Dispatch<React.SetStateAction<boolean>>,
  setToast: React.Dispatch<React.SetStateAction<string | null>>,
) => {
  if (!formData.name.trim()) {
    return;
  }

  const success = await saveProfile(formData);
  if (success) {
    setDirty(false);
    setToast("保存に成功しました");
    setTimeout(() => setToast(null), 2000);
  }
};
