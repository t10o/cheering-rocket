import { Skeleton } from "@cheering/ui";

export const EventsListSkeleton = () => {
  return (
    <div className="p-4 space-y-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="rounded-2xl border bg-white p-4">
          <div className="space-y-3">
            <Skeleton height="24px" width="60%" />
            <Skeleton height="16px" width="40%" />
            <Skeleton height="16px" width="80%" />
            <div className="flex justify-end">
              <Skeleton height="32px" width="80px" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
