import { Skeleton } from "@cheering/ui";

import { BackButton } from "@/shared/components/BackButton";
import { PageHeader } from "@/shared/components/PageHeader";

export const EditEventSkeleton = () => {
  return (
    <div className="min-h-dvh bg-gray-50">
      <PageHeader title="イベント編集" left={<BackButton />} />
      <div className="p-4 space-y-6">
        <div className="space-y-2">
          <Skeleton width="80px" height="16px" />
          <Skeleton width="100%" height="40px" />
        </div>
        <div className="space-y-2">
          <Skeleton width="100px" height="16px" />
          <div className="flex gap-3">
            <Skeleton width="100%" height="40px" />
            <Skeleton width="100%" height="40px" />
          </div>
        </div>
        <div className="space-y-2">
          <Skeleton width="60px" height="16px" />
          <Skeleton width="100%" height="112px" />
        </div>
        <div className="flex justify-end">
          <Skeleton width="80px" height="40px" />
        </div>
      </div>
    </div>
  );
};
