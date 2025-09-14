import { createFileRoute, Link } from "@tanstack/react-router";

import { Button } from "@cheering/ui";

import { EventsListContainer } from "@/features/events/components/container/EventsListContainer";
import { PageHeader } from "@/shared/components/PageHeader";

export const Route = createFileRoute("/events/")({
  component: EventsIndex,
});

function EventsIndex() {
  return (
    <div className="min-h-dvh bg-gray-50">
      <PageHeader
        title="イベント"
        right={
          <div className="flex items-center gap-2">
            <Link to="/events/join">
              <Button variant="secondary" size="sm">
                参加
              </Button>
            </Link>
            <Link to="/events/new">
              <Button size="sm">作成</Button>
            </Link>
          </div>
        }
      />
      <EventsListContainer />
    </div>
  );
}
