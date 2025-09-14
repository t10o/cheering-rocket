import { useRuns } from "../../hooks/useRuns";
import { RunsListPresenter } from "../presenter/RunsListPresenter";

export const RunsListContainer = () => {
  const { runs, loading, error } = useRuns();

  return <RunsListPresenter runs={runs} loading={loading} error={error} />;
};
