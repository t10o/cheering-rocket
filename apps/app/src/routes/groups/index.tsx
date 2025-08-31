import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/groups/")({
  component: GroupPage,
});

function GroupPage() {
  return <div>Hello !</div>;
}
