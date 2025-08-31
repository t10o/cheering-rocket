import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/runs/")({
  component: RunPage,
});

function RunPage() {
  return <div>Hello!</div>;
}
