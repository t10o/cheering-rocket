import { formatStatsDistance,formatStatsPace } from "../../functions/runStats";
import type { RunStats as RunStatsType } from "../../types";
import { RunStatsPresenter } from "../presenter/RunStatsPresenter";

export type RunStatsContainerProps = {
  stats: RunStatsType;
  className?: string;
};

export const RunStatsContainer = ({
  stats,
  className,
}: RunStatsContainerProps) => {
  return (
    <RunStatsPresenter
      stats={stats}
      className={className || ""}
      formatPace={formatStatsPace}
      formatDistance={formatStatsDistance}
    />
  );
};
