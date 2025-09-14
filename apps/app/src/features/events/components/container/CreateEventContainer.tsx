import { useState } from "react";
import { captureException } from "@/libs/sentry";
import { useNavigate } from "@tanstack/react-router";

import { createEvent, type CreateEventData } from "../../functions/createEvent";
import { CreateEventPresenter } from "../presenter/CreateEventPresenter";

import { useAuth } from "@/features/auth/hooks/useAuth";

export const CreateEventContainer = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<CreateEventData>({
    name: "",
    date: "",
    time: "",
    note: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!user) return;

    setSaving(true);
    setError(null);
    try {
      const eventId = await createEvent(formData, user.uid);
      // 完了 → 詳細へ
      navigate({ to: "/events/$eventId", params: { eventId } });
    } catch (e: unknown) {
      console.error("イベント作成エラー:", e);
      captureException(e, "イベント作成エラー");
      setError((e as Error)?.message ?? "作成に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  return (
    <CreateEventPresenter
      formData={formData}
      onNameChange={(value) =>
        setFormData((prev: CreateEventData) => ({ ...prev, name: value }))
      }
      onDateChange={(value) =>
        setFormData((prev: CreateEventData) => ({ ...prev, date: value }))
      }
      onTimeChange={(value) =>
        setFormData((prev: CreateEventData) => ({ ...prev, time: value }))
      }
      onNoteChange={(value) =>
        setFormData((prev: CreateEventData) => ({ ...prev, note: value }))
      }
      onSubmit={handleSubmit}
      saving={saving}
      error={error}
    />
  );
};
