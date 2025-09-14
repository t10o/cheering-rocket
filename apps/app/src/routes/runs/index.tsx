import { createFileRoute, Link } from "@tanstack/react-router";

import { Button } from "@cheering/ui";

import { RunsListContainer } from "@/features/runs/components/container/RunsListContainer";
import { RunStatsContainer } from "@/features/runs/components/container/RunStatsContainer";
import { useRunManager } from "@/features/runs/hooks/useRunManager";
import { useRuns } from "@/features/runs/hooks/useRuns";
import { PageHeader } from "@/shared/components/PageHeader";

export const Route = createFileRoute("/runs/")({
  component: RunsPage,
});

function RunsPage() {
  const { stats } = useRuns();
  const { activeRun } = useRunManager();

  return (
    <div className="min-h-dvh bg-gray-50">
      <PageHeader
        title="ラン管理"
        right={
          activeRun ? (
            <Link to="/runs/start">
              <Button size="sm" variant="destructive">
                ラン中...
              </Button>
            </Link>
          ) : (
            <Link to="/runs/start">
              <Button size="sm">ランを開始</Button>
            </Link>
          )
        }
      />

      <div className="p-4 space-y-6">
        <RunStatsContainer stats={stats} />
        <RunsListContainer />
      </div>
    </div>
  );
}
