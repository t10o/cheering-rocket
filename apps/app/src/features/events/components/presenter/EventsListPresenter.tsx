import { Link } from "@tanstack/react-router";
import { Button, EmptyState } from "@cheering/ui";
import { EventCardPresenter } from "./EventCardPresenter";
import { EventsListSkeleton } from "./EventsListSkeleton";
import { formatEventDate } from "../../functions/eventCard";
import type { Event } from "../../types";

export type EventsListPresenterProps = {
  events: Event[];
  loading: boolean;
  error: string | null;
};

export const EventsListPresenter = ({
  events,
  loading,
  error,
}: EventsListPresenterProps) => {
  if (loading) {
    return <EventsListSkeleton />;
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="p-4">
        <EmptyState
          icon={
            <svg
              className="w-12 h-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          }
          title="まだイベントがありません"
          description="参加したいイベントのIDを持っている場合は「イベントIDで参加」から。"
          action={
            <div className="flex flex-col sm:flex-row gap-2">
              <Link to="/events/join">
                <Button variant="secondary" size="sm">
                  イベントIDで参加
                </Button>
              </Link>
              <Link to="/events/new">
                <Button size="sm">イベントを作成</Button>
              </Link>
            </div>
          }
        />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-3">
      {events.map((event) => (
        <EventCardPresenter
          key={event.id}
          event={event}
          formatDate={formatEventDate}
        />
      ))}
    </div>
  );
};
