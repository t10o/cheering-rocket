import { Skeleton } from "@cheering/ui";

export const EventsListSkeleton = () => {
  return (
    <div className="p-4 space-y-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
        >
          <div className="space-y-2">
            <Skeleton height="24px" width="60%" />
            <div className="flex items-center gap-2">
              <Skeleton width="16px" height="16px" />
              <Skeleton height="16px" width="40%" />
            </div>
            <Skeleton height="16px" width="80%" />
          </div>
        </div>
      ))}
    </div>
  );
};
