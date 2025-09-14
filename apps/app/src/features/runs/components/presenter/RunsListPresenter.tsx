import { EmptyState } from "@cheering/ui";
import { RunCardPresenter } from "./RunCardPresenter";
import { RunsListSkeleton } from "./RunsListSkeleton";
import {
  formatRunDate,
  formatRunPace,
  formatRunDuration,
} from "../../functions/runCard";
import type { Run } from "../../types";

export type RunsListPresenterProps = {
  runs: Run[];
  loading: boolean;
  error: string | null;
};

export const RunsListPresenter = ({
  runs,
  loading,
  error,
}: RunsListPresenterProps) => {
  if (loading) {
    return <RunsListSkeleton />;
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (runs.length === 0) {
    return (
      <div className="p-4">
        <EmptyState
          icon={
            <svg
              className="w-12 h-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          }
          title="まだランレコードがありません"
          description="最初のランニングを記録して、あなたの成長を追跡しましょう。"
        />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-3">
      {runs.map((run) => (
        <RunCardPresenter
          key={run.id}
          run={run}
          formatDate={formatRunDate}
          formatPace={formatRunPace}
          formatDuration={formatRunDuration}
        />
      ))}
    </div>
  );
};
