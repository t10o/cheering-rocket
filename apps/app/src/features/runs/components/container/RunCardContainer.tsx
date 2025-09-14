import {
  formatRunDate,
  formatRunDuration,
  formatRunPace,
} from "../../functions/runCard";
import type { Run } from "../../types";
import { RunCardPresenter } from "../presenter/RunCardPresenter";

export type RunCardContainerProps = {
  run: Run;
  className?: string;
};

export const RunCardContainer = ({ run, className }: RunCardContainerProps) => {
  return (
    <RunCardPresenter
      run={run}
      className={className || ""}
      formatDate={formatRunDate}
      formatPace={formatRunPace}
      formatDuration={formatRunDuration}
    />
  );
};
