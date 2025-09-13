import { PageHeader } from "@/shared/components/PageHeader";
import { BackButton } from "@/shared/components/BackButton";
import { Button, Input } from "@cheering/ui";
import { type CreateEventData } from "../../functions/createEvent";

export type CreateEventPresenterProps = {
  formData: CreateEventData;
  onNameChange: (value: string) => void;
  onDateChange: (value: string) => void;
  onTimeChange: (value: string) => void;
  onNoteChange: (value: string) => void;
  onSubmit: () => void;
  saving: boolean;
  error: string | null;
};

export const CreateEventPresenter = ({
  formData,
  onNameChange,
  onDateChange,
  onTimeChange,
  onNoteChange,
  onSubmit,
  saving,
  error,
}: CreateEventPresenterProps) => {
  return (
    <div className="min-h-dvh bg-gray-50">
      <PageHeader title="イベント作成" left={<BackButton />} />
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
            <Input type="date" value={formData.date} onChange={onDateChange} />
            <Input type="time" value={formData.time} onChange={onTimeChange} />
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
            {saving ? "作成中..." : "作成する"}
          </Button>
        </div>
      </div>
    </div>
  );
};

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-2">
      <div className="text-sm text-gray-600">{label}</div>
      {children}
    </label>
  );
}
