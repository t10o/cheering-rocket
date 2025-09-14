import { useEffect, useState } from "react";
import { useMemo } from "react";
import { getAuth, updateProfile as updateAuthProfile } from "firebase/auth";
import {
  doc,
  getFirestore,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import {
  getDownloadURL,
  getStorage,
  ref as storageRef,
  uploadBytes,
} from "firebase/storage";

import { firebaseApp } from "../../../libs/firebase";
import { useAuth } from "../../auth/hooks/useAuth";
import type { ProfileFormData, UserProfile } from "../types";

import { captureException } from "@/libs/sentry";
import { convertImageIfNeeded } from "@/shared/functions/imageConverter";

export const useProfile = () => {
  const { user } = useAuth();
  const auth = useMemo(() => getAuth(firebaseApp), []);
  const db = useMemo(() => getFirestore(firebaseApp), []);
  const storage = useMemo(() => getStorage(firebaseApp), []);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // プロフィールデータを取得
  useEffect(() => {
    if (!user) return;

    const ref = doc(db, "users", user.uid);
    const unsub = onSnapshot(ref, (snap) => {
      const data = (snap.data() as UserProfile | undefined) ?? {
        uid: user.uid,
        name: user.displayName ?? "",
        photoURL: user.photoURL ?? "",
      };
      setProfile(data);
      setLoading(false);
    });

    return () => unsub();
  }, [db, user]);

  // プロフィールを保存
  const saveProfile = async (formData: ProfileFormData) => {
    if (!user) return;

    setSaving(true);
    setError(null);

    try {
      let newPhotoURL = formData.photoURL ?? "";

      // 画像が選ばれていればアップロード
      if (formData.pendingAvatarFile) {
        // HEIC画像の場合はJPEGに変換
        const convertedFile = await convertImageIfNeeded(
          formData.pendingAvatarFile,
        );

        const ext = (convertedFile.name.split(".").pop() || "").toLowerCase();
        const safeExt = ext && ext.length <= 5 ? ext : "jpg";
        const path = `users/${user.uid}/avatar_${Date.now()}.${safeExt}`;
        const ref = storageRef(storage, path);
        await uploadBytes(ref, convertedFile, {
          contentType: convertedFile.type || "image/jpeg",
        });
        newPhotoURL = await getDownloadURL(ref);
      }

      // Firestore 更新
      await setDoc(
        doc(db, "users", user.uid),
        {
          uid: user.uid,
          name: formData.name.trim(),
          photoURL: newPhotoURL,
          updatedAt: serverTimestamp(),
          createdAt: serverTimestamp(),
        },
        { merge: true },
      );

      // Auth プロフィールも同期
      await updateAuthProfile(auth.currentUser!, {
        displayName: formData.name.trim(),
        photoURL: newPhotoURL || null,
      });

      return true;
    } catch (e: unknown) {
      console.error("プロフィール更新エラー:", e);
      captureException(e, "プロフィール更新エラー");
      setError((e as Error)?.message ?? "更新に失敗しました");
      return false;
    } finally {
      setSaving(false);
    }
  };

  return {
    profile,
    loading,
    saving,
    error,
    saveProfile,
  };
};
