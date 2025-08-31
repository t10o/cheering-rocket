import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import clsx from "clsx";
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

import { Avatar } from "./components/Avatar";

import { useAuth } from "@/hooks/useAuth";
import { firebaseApp } from "@/libs/firebase";

export const Route = createFileRoute("/profile/")({
  component: ProfilePage,
});

type UserDoc = { uid: string; name: string; photoURL: string };

function ProfilePage() {
  const { user } = useAuth();
  const auth = useMemo(() => getAuth(firebaseApp), []);
  const db = useMemo(() => getFirestore(firebaseApp), []);
  const storage = useMemo(() => getStorage(firebaseApp), []);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [photoURL, setPhotoURL] = useState<string | null>(null); // 既存URL（保存済み）
  const [dirty, setDirty] = useState(false);

  // 保存ボタン時にだけアップロードする用
  const [pendingAvatarFile, setPendingAvatarFile] = useState<File | null>(null);
  const [pendingPreviewURL, setPendingPreviewURL] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (!user) return;
    const ref = doc(db, "users", user.uid);
    const unsub = onSnapshot(ref, (snap) => {
      const d = (snap.data() as UserDoc | undefined) ?? {
        uid: user.uid,
        name: user.displayName ?? "",
        photoURL: user.photoURL ?? "",
      };
      setName(d.name ?? "");
      setPhotoURL(d.photoURL || null);
      setLoading(false);
      setDirty(false);
      // 新しい doc を読んだらプレビューは破棄
      if (pendingPreviewURL) {
        URL.revokeObjectURL(pendingPreviewURL);
        setPendingPreviewURL(null);
        setPendingAvatarFile(null);
      }
    });
    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db, user]);

  function onSelectFile(file: File) {
    // 古いプレビューURLを解放
    if (pendingPreviewURL) URL.revokeObjectURL(pendingPreviewURL);
    setPendingAvatarFile(file);
    const preview = URL.createObjectURL(file);
    setPendingPreviewURL(preview);
    setDirty(true);
  }

  async function handleSave() {
    if (!user) return;
    if (!name.trim()) {
      setError("ユーザー名を入力してください");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      let newPhotoURL = photoURL ?? "";

      // 画像が選ばれていれば、ここで初めてアップロード
      if (pendingAvatarFile) {
        const ext = (
          pendingAvatarFile.name.split(".").pop() || ""
        ).toLowerCase();
        const safeExt = ext && ext.length <= 5 ? ext : "jpg";
        const path = `users/${user.uid}/avatar_${Date.now()}.${safeExt}`;
        const ref = storageRef(storage, path);
        await uploadBytes(ref, pendingAvatarFile, {
          contentType: pendingAvatarFile.type || "image/jpeg",
        });
        newPhotoURL = await getDownloadURL(ref);
      }

      // Firestore 更新
      await setDoc(
        doc(db, "users", user.uid),
        {
          uid: user.uid,
          name: name.trim(),
          photoURL: newPhotoURL,
          updatedAt: serverTimestamp(),
          createdAt: serverTimestamp(),
        },
        { merge: true },
      );

      // Auth プロフィールも同期（アプリ内表示用）
      await updateAuthProfile(auth.currentUser!, {
        displayName: name.trim(),
        photoURL: newPhotoURL || null,
      });

      // 画面状態更新
      setPhotoURL(newPhotoURL || null);
      if (pendingPreviewURL) URL.revokeObjectURL(pendingPreviewURL);
      setPendingPreviewURL(null);
      setPendingAvatarFile(null);
      setDirty(false);

      setToast("保存に成功しました");
      setTimeout(() => setToast(null), 2000);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      setError(e?.message ?? "更新に失敗しました");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="p-4">Loading...</div>;

  const formCls = ["p-4", "space-y-6", "pb-[var(--safe-area-inset-bottom)]"];
  const labelCls = ["block", "text-sm", "text-gray-600", "mb-1"];
  const inputCls = [
    "w-full",
    "rounded-xl",
    "border",
    "border-gray-300",
    "px-3",
    "py-2.5",
    "text-base",
    "bg-white",
    "focus:outline-none",
    "focus:ring-2",
    "focus:ring-blue-500",
  ];
  const btnRow = ["flex", "gap-3", "justify-end"];
  const saveBtn = [
    "inline-flex",
    "items-center",
    "justify-center",
    "rounded-xl",
    "px-4",
    "py-2.5",
    "font-medium",
    "bg-blue-600",
    "text-white",
    "hover:bg-blue-700",
    "disabled:opacity-50",
    "disabled:cursor-not-allowed",
    "touch-manipulation",
  ];
  const uploadBtn = [
    "inline-flex",
    "items-center",
    "justify-center",
    "rounded-xl",
    "px-3",
    "py-2",
    "text-sm",
    "border",
    "border-gray-300",
    "bg-white",
    "hover:bg-gray-50",
  ];

  return (
    <div className="relative min-h-dvh bg-gray-50">
      <div className={clsx(formCls)}>
        {/* アバター */}
        <section className="flex items-center gap-4">
          <Avatar photoURL={pendingPreviewURL ?? photoURL} size={72} />
          <div className="flex flex-col gap-2">
            <label htmlFor="avatar-input" className={clsx(uploadBtn)}>
              画像を選択
            </label>
            <input
              id="avatar-input"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onSelectFile(f);
              }}
            />
          </div>
        </section>

        {/* ユーザー名 */}
        <section>
          {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
          <label className={clsx(labelCls)}>ユーザー名</label>
          <input
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setDirty(true);
            }}
            placeholder="表示名"
            className={clsx(inputCls)}
            maxLength={50}
          />
          <p className="mt-1 text-xs text-gray-500">{name.length}/50</p>
        </section>

        {/* エラー */}
        {error && <div className="text-sm text-red-600">{error}</div>}

        {/* 操作 */}
        <div className={clsx(btnRow)}>
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={!dirty || saving}
            className={clsx(saveBtn)}
          >
            {saving ? "保存中..." : "保存"}
          </button>
        </div>
      </div>

      {/* 成功トースト */}
      {toast && (
        <div className="fixed left-1/2 top-[calc(12px+var(--safe-area-inset-top))] z-[9999] -translate-x-1/2">
          <div className="rounded-xl bg-black/80 px-4 py-2 text-sm text-white shadow-lg">
            {toast}
          </div>
        </div>
      )}
    </div>
  );
}
