import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";

import { fetchEventDetail } from "../../functions/eventDetail";
import { convertEventToFormData } from "../../functions/loadEventForEdit";
import { updateEvent, type UpdateEventData } from "../../functions/updateEvent";
import { EditEventPresenter } from "../presenter/EditEventPresenter";
import { EditEventSkeleton } from "../presenter/EditEventSkeleton";

import { useAuth } from "@/features/auth/hooks/useAuth";
import { captureException } from "@/libs/sentry";

export type EditEventContainerProps = {
  eventId: string;
};

export const EditEventContainer = ({ eventId }: EditEventContainerProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<UpdateEventData>({
    name: "",
    date: "",
    time: "",
    note: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // イベントデータを読み込んでフォームに設定
  useEffect(() => {
    const loadEventData = async () => {
      if (!user) return;

      setLoading(true);
      try {
        const { event } = await fetchEventDetail(eventId);

        // 権限チェック
        if (event.ownerUid !== user?.uid) {
          setError("このイベントを編集する権限がありません");
          return;
        }

        // フォームデータを設定
        setFormData(convertEventToFormData(event));
      } catch (e: unknown) {
        console.error("イベントデータの読み込みエラー:", e);
        captureException(e, "イベントデータの読み込みエラー");
        setError(
          (e as Error)?.message ?? "イベントデータの読み込みに失敗しました",
        );
      } finally {
        setLoading(false);
      }
    };

    loadEventData();
  }, [eventId, user]);

  const handleSubmit = async () => {
    if (!user) return;

    setSaving(true);
    setError(null);
    try {
      await updateEvent(eventId, formData, user.uid);
      // 完了 → 詳細へ
      navigate({ to: "/events/$eventId", params: { eventId } });
    } catch (e: unknown) {
      console.error("イベント更新エラー:", e);
      captureException(e, "イベント更新エラー");
      setError((e as Error)?.message ?? "更新に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <EditEventSkeleton />;
  }

  return (
    <EditEventPresenter
      formData={formData}
      onNameChange={(value) =>
        setFormData((prev: UpdateEventData) => ({ ...prev, name: value }))
      }
      onDateChange={(value) =>
        setFormData((prev: UpdateEventData) => ({ ...prev, date: value }))
      }
      onTimeChange={(value) =>
        setFormData((prev: UpdateEventData) => ({ ...prev, time: value }))
      }
      onNoteChange={(value) =>
        setFormData((prev: UpdateEventData) => ({ ...prev, note: value }))
      }
      onSubmit={handleSubmit}
      saving={saving}
      error={error}
    />
  );
};
