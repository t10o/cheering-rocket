import { createFileRoute } from "@tanstack/react-router";
import { JoinEventContainer } from "@/features/events/components/container/JoinEventContainer";

export const Route = createFileRoute("/events/join/")({
  component: JoinEventPage,
});

function JoinEventPage() {
  return <JoinEventContainer />;
}
