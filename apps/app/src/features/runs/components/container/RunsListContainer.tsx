import { RunsListPresenter } from "../presenter/RunsListPresenter";
import { useRuns } from "../../hooks/useRuns";

export const RunsListContainer = () => {
  const { runs, loading, error } = useRuns();

  return <RunsListPresenter runs={runs} loading={loading} error={error} />;
};
