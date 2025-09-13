import { RunCardPresenter } from "../presenter/RunCardPresenter";
import {
  formatRunDate,
  formatRunPace,
  formatRunDuration,
} from "../../functions/runCard";
import type { Run } from "../../types";

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
