import { Card, Skeleton } from "@cheering/ui";

export const ProfileFormSkeleton = () => {
  return (
    <div className="p-4 space-y-6">
      <Card className="p-6">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton width="80px" height="80px" rounded="full" />
            <div className="space-y-2">
              <Skeleton width="120px" height="24px" />
              <Skeleton width="100px" height="16px" />
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <Skeleton width="60px" height="16px" className="mb-2" />
              <Skeleton width="100%" height="40px" />
            </div>
          </div>
          <div className="flex justify-end">
            <Skeleton width="80px" height="36px" />
          </div>
        </div>
      </Card>
    </div>
  );
};
