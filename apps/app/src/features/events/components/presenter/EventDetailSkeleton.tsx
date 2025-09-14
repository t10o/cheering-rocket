import { PageHeader } from "@/shared/components/PageHeader";
import { BackButton } from "@/shared/components/BackButton";
import { Skeleton } from "@cheering/ui";

export const EventDetailSkeleton = () => {
  return (
    <div className="min-h-dvh bg-gradient-to-br from-gray-50 to-gray-100">
      <PageHeader
        title={<Skeleton width="120px" height="24px" />}
        left={<BackButton />}
      />
      <div className="p-4 space-y-6">
        {/* 概要セクション */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <Skeleton width="60px" height="20px" />
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-start gap-4">
              <Skeleton width="32px" height="32px" rounded="full" />
              <div className="flex-1 space-y-2">
                <Skeleton width="100px" height="16px" />
                <Skeleton width="200px" height="20px" />
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Skeleton width="32px" height="32px" rounded="full" />
              <div className="flex-1 space-y-2">
                <Skeleton width="80px" height="16px" />
                <Skeleton width="150px" height="20px" />
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Skeleton width="32px" height="32px" rounded="full" />
              <div className="flex-1 space-y-2">
                <Skeleton width="60px" height="16px" />
                <Skeleton width="100px" height="20px" />
              </div>
            </div>
          </div>
        </div>

        {/* イベントIDセクション */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <Skeleton width="80px" height="20px" />
          </div>
          <div className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
                <Skeleton width="200px" height="16px" />
              </div>
              <Skeleton width="60px" height="32px" rounded="lg" />
            </div>
            <Skeleton width="280px" height="16px" className="mt-3" />
          </div>
        </div>

        {/* 応援用URLセクション */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <Skeleton width="100px" height="20px" />
          </div>
          <div className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
                <Skeleton width="250px" height="16px" />
              </div>
              <Skeleton width="60px" height="32px" rounded="lg" />
            </div>
            <Skeleton width="200px" height="16px" className="mt-3" />
          </div>
        </div>

        {/* メンバーセクション */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <Skeleton width="80px" height="20px" />
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-200"
                >
                  <Skeleton width="40px" height="40px" rounded="full" />
                  <div className="flex-1">
                    <Skeleton width="120px" height="16px" />
                  </div>
                  <Skeleton width="60px" height="24px" rounded="full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
