import { useState } from "react";

import { useRunManager } from "../../hooks/useRunManager";
import { RunActivePresenter } from "../presenter/RunActivePresenter";

export const RunActiveContainer = () => {
  const { activeRun, endRun, loading, error } = useRunManager();
  const [showEndDialog, setShowEndDialog] = useState(false);
  const [confirmationText, setConfirmationText] = useState("");

  const handleEndRun = async () => {
    const success = await endRun(confirmationText);
    if (success) {
      setShowEndDialog(false);
      setConfirmationText("");
    }
  };

  const handleShowEndDialog = () => {
    setShowEndDialog(true);
    setConfirmationText("");
  };

  const handleCancelEnd = () => {
    setShowEndDialog(false);
    setConfirmationText("");
  };

  if (!activeRun) {
    return null;
  }

  return (
    <RunActivePresenter
      activeRun={activeRun}
      showEndDialog={showEndDialog}
      confirmationText={confirmationText}
      loading={loading}
      error={error}
      onEndRun={handleEndRun}
      onShowEndDialog={handleShowEndDialog}
      onCancelEnd={handleCancelEnd}
      onConfirmationTextChange={setConfirmationText}
    />
  );
};
