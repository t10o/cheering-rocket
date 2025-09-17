import { Button, Card, Input, Toast } from "@cheering/ui";

import type { ProfileFormData } from "../../types";

import { Avatar } from "./Avatar";
import { ProfileFormSkeleton } from "./ProfileFormSkeleton";

export type ProfileFormPresenterProps = {
  formData: ProfileFormData;
  loading: boolean;
  saving: boolean;
  error: string | null;
  toast: string | null;
  onFileSelect: (file: File) => void;
  onNameChange: (value: string) => void;
  onSave: () => void;
  onToastClose: () => void;
  onSignOut: () => void;
  signingOut: boolean;
};

export const ProfileFormPresenter = ({
  formData,
  loading,
  saving,
  error,
  toast,
  onFileSelect,
  onNameChange,
  onSave,
  onToastClose,
  onSignOut,
  signingOut,
}: ProfileFormPresenterProps) => {
  if (loading) {
    return <ProfileFormSkeleton />;
  }

  return (
    <div className="min-h-dvh bg-gray-50">
      <div className="p-4 space-y-6 pb-[var(--safe-area-inset-bottom)]">
        {/* アバター */}
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <Avatar
              photoURL={formData.pendingPreviewURL ?? formData.photoURL}
              name={formData.name}
              size={72}
            />
            <div className="flex flex-col gap-2">
              <label
                htmlFor="avatar-input"
                className="inline-flex items-center justify-center rounded-xl px-3 py-2 text-sm border border-gray-300 bg-white hover:bg-gray-50 cursor-pointer transition-colors"
              >
                画像を選択
              </label>
              <input
                id="avatar-input"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onFileSelect(file);
                }}
              />
              <p className="text-xs text-gray-500">
                HEIC形式の画像は自動的にJPEGに変換されます
              </p>
            </div>
          </div>
        </Card>

        {/* ユーザー名 */}
        <Card className="p-6">
          <Input
            label="ユーザー名"
            value={formData.name}
            onChange={(value: string) => onNameChange(value)}
            placeholder="表示名"
            maxLength={50}
            helperText={`${formData.name.length}/50`}
          />
        </Card>

        {/* エラー */}
        {error && (
          <Card className="p-4 border-red-200 bg-red-50">
            <p className="text-sm text-red-600">{error}</p>
          </Card>
        )}

        {/* 保存ボタン */}
        <div className="flex justify-end">
          <Button
            onPress={onSave}
            isDisabled={saving}
            size="lg"
            className="min-w-[120px]"
          >
            {saving ? "保存中..." : "保存"}
          </Button>
        </div>

        <Card className="p-6">
          <Button
            onPress={onSignOut}
            isDisabled={signingOut}
            variant="destructive"
            className="w-full"
          >
            {signingOut ? "ログアウト中..." : "ログアウト"}
          </Button>
        </Card>
      </div>

      {/* トースト */}
      {toast && (
        <Toast variant="success" onClose={onToastClose}>
          {toast}
        </Toast>
      )}
    </div>
  );
};
