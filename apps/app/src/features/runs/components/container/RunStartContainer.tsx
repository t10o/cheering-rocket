import { useEffect, useState } from "react";

import { useBackgroundGeolocation } from "../../hooks/useBackgroundGeolocation";
import { useRunManager } from "../../hooks/useRunManager";
import { useTodayEvents } from "../../hooks/useTodayEvents";
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
  const {
    openSettings,
    hasBackgroundPermission,
    checkingBackgroundPermission,
    refreshBackgroundPermission,
  } = useBackgroundGeolocation();
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [permissionError, setPermissionError] = useState<string | null>(null);

  useEffect(() => {
    if (hasBackgroundPermission) {
      setPermissionError(null);
    }
  }, [hasBackgroundPermission]);

  const handleStartRun = async () => {
    if (!selectedEventId) {
      return;
    }
    const granted = await refreshBackgroundPermission();
    if (!granted) {
      setPermissionError(
        "バックグラウンド位置情報を\"常に許可\"に設定してください。",
      );
      return;
    }
    setPermissionError(null);
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
      startError={permissionError ?? startError}
      hasBackgroundPermission={hasBackgroundPermission}
      checkingBackgroundPermission={checkingBackgroundPermission}
      onEventSelect={handleEventSelect}
      onStartRun={handleStartRun}
      onOpenSettings={handleOpenSettings}
    />
  );
};
