import { createFileRoute } from "@tanstack/react-router";
import { CreateEventContainer } from "@/features/events/components/container/CreateEventContainer";

export const Route = createFileRoute("/events/new/")({
  component: NewEventPage,
});

function NewEventPage() {
  return <CreateEventContainer />;
}
