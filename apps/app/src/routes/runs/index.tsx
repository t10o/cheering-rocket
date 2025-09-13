import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/shared/components/PageHeader";
import { Button } from "@cheering/ui";
import { RunsListContainer } from "@/features/runs/components/container/RunsListContainer";
import { RunStatsContainer } from "@/features/runs/components/container/RunStatsContainer";
import { useRuns } from "@/features/runs/hooks/useRuns";

export const Route = createFileRoute("/runs/")({
  component: RunsPage,
});

function RunsPage() {
  const { stats } = useRuns();

  return (
    <div className="min-h-dvh bg-gray-50">
      <PageHeader
        title="ラン管理"
        right={<Button size="sm">記録を追加</Button>}
      />

      <div className="p-4 space-y-6">
        <RunStatsContainer stats={stats} />
        <RunsListContainer />
      </div>
    </div>
  );
}
