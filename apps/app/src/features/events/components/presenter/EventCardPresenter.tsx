import { Link } from "@tanstack/react-router";

import { Card } from "@cheering/ui";

import type { Event } from "../../types";

export type EventCardPresenterProps = {
  event: Event;
  className?: string;
  formatDate: (timestamp: any) => string;
};

export const EventCardPresenter = ({
  event,
  className,
  formatDate,
}: EventCardPresenterProps) => {
  return (
    <Link
      to="/events/$eventId"
      params={{ eventId: event.id }}
      className="block"
    >
      <Card
        interactive
        className={className || ""}
        role="button"
        aria-label={`${event.name}の詳細を見る`}
      >
        <div className="space-y-2">
          <h3 className="font-semibold text-gray-900 text-lg">{event.name}</h3>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span>{formatDate(event.plannedAt)}</span>
          </div>

          {event.note && (
            <p className="text-sm text-gray-600 line-clamp-2">{event.note}</p>
          )}
        </div>
      </Card>
    </Link>
  );
};
