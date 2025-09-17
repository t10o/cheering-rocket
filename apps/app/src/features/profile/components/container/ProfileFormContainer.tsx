import { useEffect, useState } from "react";
import { useRouter } from "@tanstack/react-router";

import {
  handleFileSelect,
  handleNameChange,
  handleSave,
} from "../../functions/profileForm";
import { useProfile } from "../../hooks/useProfile";
import type { ProfileFormData } from "../../types";
import { ProfileFormPresenter } from "../presenter/ProfileFormPresenter";

import { signOut } from "@/libs/firebaseAuth";
import { captureException } from "@/libs/sentry";

export const ProfileFormContainer = () => {
  const { profile, loading, saving, error, saveProfile } = useProfile();
  const router = useRouter();
  const [formData, setFormData] = useState<ProfileFormData>({
    name: "",
    photoURL: null,
    pendingAvatarFile: null,
    pendingPreviewURL: null,
  });
  const [toast, setToast] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState<string | null>(null);

  // プロフィールデータが読み込まれたらフォームに反映
  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name,
        photoURL: profile.photoURL,
        pendingAvatarFile: null,
        pendingPreviewURL: null,
      });
    }
  }, [profile]);

  const onFileSelect = async (file: File) => {
    await handleFileSelect(file, setFormData);
  };

  const onNameChange = (value: string) => {
    handleNameChange(value, setFormData);
  };

  const onSave = async () => {
    await handleSave(formData, saveProfile, setToast);
  };

  const onToastClose = () => {
    setToast(null);
  };

  const onSignOut = async () => {
    setSignOutError(null);
    setSigningOut(true);
    try {
      await signOut();
      router.navigate({ to: "/auth/signin" });
    } catch (err) {
      console.error("ログアウトに失敗しました", err);
      captureException(err, "ログアウトに失敗しました");
      setSignOutError("ログアウトに失敗しました");
    } finally {
      setSigningOut(false);
    }
  };

  const combinedError = error ?? signOutError;

  return (
    <ProfileFormPresenter
      formData={formData}
      loading={loading}
      saving={saving}
      error={combinedError}
      toast={toast}
      onFileSelect={onFileSelect}
      onNameChange={onNameChange}
      onSave={onSave}
      onToastClose={onToastClose}
      onSignOut={onSignOut}
      signingOut={signingOut}
    />
  );
};
