import { useEvents } from "../../hooks/useEvents";
import { EventsListPresenter } from "../presenter/EventsListPresenter";

export const EventsListContainer = () => {
  const { events, loading, error } = useEvents();

  return (
    <EventsListPresenter events={events} loading={loading} error={error} />
  );
};
