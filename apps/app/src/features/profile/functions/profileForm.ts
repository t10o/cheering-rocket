import * as Sentry from "@sentry/react";

import type { ProfileFormData } from "../types";

import { convertImageIfNeeded } from "@/shared/functions/imageConverter";

export const handleFileSelect = async (
  file: File,
  setFormData: React.Dispatch<React.SetStateAction<ProfileFormData>>,
) => {
  // 古いプレビューURLを解放
  setFormData((prev) => {
    if (prev.pendingPreviewURL) {
      URL.revokeObjectURL(prev.pendingPreviewURL);
    }
    return prev;
  });

  try {
    // HEIC画像の場合はJPEGに変換
    const convertedFile = await convertImageIfNeeded(file);

    const preview = URL.createObjectURL(convertedFile);
    setFormData((prev) => ({
      ...prev,
      pendingAvatarFile: convertedFile,
      pendingPreviewURL: preview,
    }));
  } catch (error) {
    console.error("画像変換に失敗しました:", error);
    Sentry.captureException(error);
    // 変換に失敗した場合は元のファイルを使用
    const preview = URL.createObjectURL(file);
    setFormData((prev) => ({
      ...prev,
      pendingAvatarFile: file,
      pendingPreviewURL: preview,
    }));
  }
};

export const handleNameChange = (
  value: string,
  setFormData: React.Dispatch<React.SetStateAction<ProfileFormData>>,
) => {
  setFormData((prev) => ({ ...prev, name: value }));
};

export const handleSave = async (
  formData: ProfileFormData,
  saveProfile: (data: ProfileFormData) => Promise<boolean | undefined>,
  setToast: React.Dispatch<React.SetStateAction<string | null>>,
) => {
  if (!formData.name.trim()) {
    return;
  }

  const success = await saveProfile(formData);
  if (success) {
    setToast("保存に成功しました");
    setTimeout(() => setToast(null), 2000);
  }
};
