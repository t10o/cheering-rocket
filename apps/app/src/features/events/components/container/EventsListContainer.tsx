import { EventsListPresenter } from "../presenter/EventsListPresenter";
import { useEvents } from "../../hooks/useEvents";

export const EventsListContainer = () => {
  const { events, loading, error } = useEvents();

  return (
    <EventsListPresenter events={events} loading={loading} error={error} />
  );
};
