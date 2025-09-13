import { useState, useEffect } from "react";
import { ProfileFormPresenter } from "../presenter/ProfileFormPresenter";
import { useProfile } from "../../hooks/useProfile";
import {
  handleFileSelect,
  handleNameChange,
  handleSave,
} from "../../functions/profileForm";
import type { ProfileFormData } from "../../types";

export const ProfileFormContainer = () => {
  const { profile, loading, saving, error, saveProfile } = useProfile();
  const [formData, setFormData] = useState<ProfileFormData>({
    name: "",
    photoURL: null,
    pendingAvatarFile: null,
    pendingPreviewURL: null,
  });
  const [dirty, setDirty] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // プロフィールデータが読み込まれたらフォームに反映
  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name,
        photoURL: profile.photoURL,
        pendingAvatarFile: null,
        pendingPreviewURL: null,
      });
      setDirty(false);
    }
  }, [profile]);

  const onFileSelect = (file: File) => {
    handleFileSelect(file, setFormData);
    setDirty(true);
  };

  const onNameChange = (value: string) => {
    handleNameChange(value, setFormData, setDirty);
  };

  const onSave = async () => {
    await handleSave(formData, saveProfile, setDirty, setToast);
  };

  const onToastClose = () => {
    setToast(null);
  };

  return (
    <ProfileFormPresenter
      formData={formData}
      loading={loading}
      saving={saving}
      error={error}
      toast={toast}
      onFileSelect={onFileSelect}
      onNameChange={onNameChange}
      onSave={onSave}
      onToastClose={onToastClose}
    />
  );
};
