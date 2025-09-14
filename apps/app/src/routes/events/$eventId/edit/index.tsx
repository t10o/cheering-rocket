import { createFileRoute } from "@tanstack/react-router";

import { EditEventContainer } from "@/features/events/components/container/EditEventContainer";

export const Route = createFileRoute("/events/$eventId/edit/")({
  component: EditEventPage,
});

function EditEventPage() {
  const { eventId } = Route.useParams();
  return <EditEventContainer eventId={eventId} />;
}
