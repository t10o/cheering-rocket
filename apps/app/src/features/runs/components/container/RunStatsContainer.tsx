import { RunStatsPresenter } from "../presenter/RunStatsPresenter";
import { formatStatsPace, formatStatsDistance } from "../../functions/runStats";
import type { RunStats as RunStatsType } from "../../types";

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
