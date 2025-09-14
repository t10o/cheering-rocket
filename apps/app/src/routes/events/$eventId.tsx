import { createFileRoute } from "@tanstack/react-router";

import { EventDetailContainer } from "@/features/events/components/container/EventDetailContainer";

export const Route = createFileRoute("/events/$eventId")({
  component: EventDetail,
});

function EventDetail() {
  const { eventId } = Route.useParams();
  return <EventDetailContainer eventId={eventId} />;
}
