import { Card } from "@cheering/ui";
import type { RunStats as RunStatsType } from "../../types";

export type RunStatsPresenterProps = {
  stats: RunStatsType;
  className?: string;
  formatPace: (pace: number) => string;
  formatDistance: (distance: number) => string;
};

export const RunStatsPresenter = ({
  stats,
  className,
  formatPace,
  formatDistance,
}: RunStatsPresenterProps) => {
  return (
    <div className={`grid grid-cols-2 gap-3 ${className || ""}`}>
      <Card className="p-4 text-center">
        <div className="text-2xl font-bold text-marathon-600">
          {formatDistance(stats.totalDistance)}
        </div>
        <div className="text-sm text-gray-500">総距離</div>
      </Card>

      <Card className="p-4 text-center">
        <div className="text-2xl font-bold text-finish-600">
          {stats.totalRuns}
        </div>
        <div className="text-sm text-gray-500">総ランニング回数</div>
      </Card>

      <Card className="p-4 text-center">
        <div className="text-2xl font-bold text-pace-600">
          {formatPace(stats.averagePace)}
        </div>
        <div className="text-sm text-gray-500">平均ペース</div>
      </Card>

      <Card className="p-4 text-center">
        <div className="text-2xl font-bold text-marathon-600">
          {formatPace(stats.bestPace)}
        </div>
        <div className="text-sm text-gray-500">ベストペース</div>
      </Card>
    </div>
  );
};
