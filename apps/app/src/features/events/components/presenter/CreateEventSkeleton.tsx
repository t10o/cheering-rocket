import { Skeleton } from "@cheering/ui";

export const CreateEventSkeleton = () => {
  return (
    <div className="p-4 space-y-6">
      <Field label="イベント名">
        <Skeleton height="40px" />
      </Field>

      <Field label="ランの予定日">
        <div className="flex gap-3">
          <Skeleton height="40px" width="50%" />
          <Skeleton height="40px" width="50%" />
        </div>
      </Field>

      <Field label="備考">
        <Skeleton height="112px" />
      </Field>

      <div className="flex justify-end">
        <Skeleton width="80px" height="36px" />
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
