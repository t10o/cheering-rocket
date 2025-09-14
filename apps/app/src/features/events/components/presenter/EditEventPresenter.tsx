import { Button, Input } from "@cheering/ui";

import { type UpdateEventData } from "../../functions/updateEvent";

import { EditEventSkeleton } from "./EditEventSkeleton";

import { BackButton } from "@/shared/components/BackButton";
import { Field } from "@/shared/components/Field";
import { PageHeader } from "@/shared/components/PageHeader";

export type EditEventPresenterProps = {
  formData: UpdateEventData;
  onNameChange: (value: string) => void;
  onDateChange: (value: string) => void;
  onTimeChange: (value: string) => void;
  onNoteChange: (value: string) => void;
  onSubmit: () => void;
  saving: boolean;
  error: string | null;
};

export const EditEventPresenter = ({
  formData,
  onNameChange,
  onDateChange,
  onTimeChange,
  onNoteChange,
  onSubmit,
  saving,
  error,
}: EditEventPresenterProps) => {
  return (
    <div className="min-h-dvh bg-gray-50">
      <PageHeader title="イベント編集" left={<BackButton />} />
      {saving ? (
        <EditEventSkeleton />
      ) : (
        <div className="p-4 space-y-6">
          <Field label="イベント名">
            <Input
              value={formData.name}
              onChange={onNameChange}
              maxLength={80}
              placeholder="イベント名を入力"
            />
          </Field>

          <Field label="ランの予定日">
            <div className="flex gap-3">
              <Input
                type="date"
                value={formData.date}
                onChange={onDateChange}
              />
              <Input
                type="time"
                value={formData.time}
                onChange={onTimeChange}
              />
            </div>
          </Field>

          <Field label="備考">
            <textarea
              className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-600 h-28 resize-vertical"
              value={formData.note}
              onChange={(e) => onNoteChange(e.target.value)}
              placeholder="備考を入力（任意）"
            />
          </Field>

          {error && <div className="text-sm text-red-600">{error}</div>}

          <div className="flex justify-end">
            <Button onClick={onSubmit} isDisabled={saving}>
              {saving ? "更新中..." : "更新する"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
