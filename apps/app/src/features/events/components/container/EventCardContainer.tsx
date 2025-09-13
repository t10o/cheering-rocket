import { EventCardPresenter } from "../presenter/EventCardPresenter";
import { formatEventDate } from "../../functions/eventCard";
import type { Event } from "../../types";

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
