import { PageHeader } from "@/shared/components/PageHeader";
import { BackButton } from "@/shared/components/BackButton";
import { Skeleton } from "@cheering/ui";

export const JoinEventSkeleton = () => {
  return (
    <div className="min-h-dvh bg-gray-50">
      <PageHeader title="イベントIDで参加" left={<BackButton />} />
      <div className="p-4 space-y-4">
        <div className="flex gap-2">
          <Skeleton width="100%" height="40px" />
          <Skeleton width="60px" height="32px" />
        </div>

        <div className="rounded-2xl border bg-white p-4 space-y-2">
          <Skeleton height="24px" width="150px" />
          <Skeleton height="16px" width="100px" />
          <div className="pt-2">
            <Skeleton height="40px" width="80px" />
          </div>
        </div>
      </div>
    </div>
  );
};
