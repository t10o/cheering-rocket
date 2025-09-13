import { Card } from "@cheering/ui";
import type { Run } from "../../types";

export type RunCardPresenterProps = {
  run: Run;
  className?: string;
  formatDate: (timestamp: any) => string;
  formatPace: (pace: number) => string;
  formatDuration: (duration: number) => string;
};

export const RunCardPresenter = ({
  run,
  className,
  formatDate,
  formatPace,
  formatDuration,
}: RunCardPresenterProps) => {
  return (
    <Card className={className || ""}>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">{run.distance}km</h3>
          <span className="text-sm text-gray-500">{formatDate(run.date)}</span>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">ペース</span>
            <div className="font-medium text-marathon-600">
              {formatPace(run.pace)}
            </div>
          </div>
          <div>
            <span className="text-gray-500">時間</span>
            <div className="font-medium">{formatDuration(run.duration)}</div>
          </div>
        </div>

        {run.notes && (
          <p className="text-sm text-gray-600 line-clamp-2">{run.notes}</p>
        )}

        <div className="flex items-center gap-4 text-xs text-gray-500">
          {run.weather && <span>天気: {run.weather}</span>}
          {run.temperature && <span>{run.temperature}°C</span>}
          {run.heartRate && <span>心拍: {run.heartRate}bpm</span>}
        </div>
      </div>
    </Card>
  );
};
