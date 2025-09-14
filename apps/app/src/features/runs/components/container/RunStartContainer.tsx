import { useState } from "react";
import { useRunManager } from "../../hooks/useRunManager";
import { useTodayEvents } from "../../hooks/useTodayEvents";
import { useBackgroundGeolocation } from "../../hooks/useBackgroundGeolocation";
import { RunStartPresenter } from "../presenter/RunStartPresenter";

export const RunStartContainer = () => {
  const {
    events,
    loading: eventsLoading,
    error: eventsError,
  } = useTodayEvents();
  const {
    startRun,
    loading: startLoading,
    error: startError,
  } = useRunManager();
  const { openSettings } = useBackgroundGeolocation();
  const [selectedEventId, setSelectedEventId] = useState<string>("");

  const handleStartRun = async () => {
    if (!selectedEventId) {
      return;
    }

    await startRun(selectedEventId);
  };

  const handleEventSelect = (eventId: string) => {
    setSelectedEventId(eventId);
  };

  const handleOpenSettings = () => {
    openSettings();
  };

  return (
    <RunStartPresenter
      events={events}
      selectedEventId={selectedEventId}
      eventsLoading={eventsLoading}
      startLoading={startLoading}
      eventsError={eventsError}
      startError={startError}
      onEventSelect={handleEventSelect}
      onStartRun={handleStartRun}
      onOpenSettings={handleOpenSettings}
    />
  );
};
