import { createFileRoute } from "@tanstack/react-router";

import { RunMainContainer } from "@/features/runs/components/container/RunMainContainer";

export const Route = createFileRoute("/runs/start/")({
  component: RunStartPage,
});

function RunStartPage() {
  return <RunMainContainer />;
}
