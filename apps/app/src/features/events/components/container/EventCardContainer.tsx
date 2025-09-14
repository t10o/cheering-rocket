import { formatEventDate } from "../../functions/eventCard";
import type { Event } from "../../types";
import { EventCardPresenter } from "../presenter/EventCardPresenter";

export type EventCardContainerProps = {
  event: Event;
  className?: string;
};

export const EventCardContainer = ({
  event,
  className,
}: EventCardContainerProps) => {
  return (
    <EventCardPresenter
      event={event}
      className={className || ""}
      formatDate={formatEventDate}
    />
  );
};
