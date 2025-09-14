import { Skeleton } from "@cheering/ui";

export const RunsListSkeleton = () => {
  return (
    <div className="p-4 space-y-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="rounded-2xl border bg-white p-4">
          <div className="space-y-3">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <Skeleton height="20px" width="120px" />
                <Skeleton height="16px" width="80px" />
              </div>
              <Skeleton height="32px" width="60px" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center space-y-1">
                <Skeleton height="16px" width="40px" className="mx-auto" />
                <Skeleton height="12px" width="60px" className="mx-auto" />
              </div>
              <div className="text-center space-y-1">
                <Skeleton height="16px" width="50px" className="mx-auto" />
                <Skeleton height="12px" width="60px" className="mx-auto" />
              </div>
              <div className="text-center space-y-1">
                <Skeleton height="16px" width="40px" className="mx-auto" />
                <Skeleton height="12px" width="60px" className="mx-auto" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
