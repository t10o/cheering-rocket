import { useRunManager } from "../../hooks/useRunManager";

import { RunActiveContainer } from "./RunActiveContainer";
import { RunStartContainer } from "./RunStartContainer";

export const RunMainContainer = () => {
  const { activeRun } = useRunManager();

  // アクティブなランがある場合はラン中の画面を表示
  if (activeRun) {
    return <RunActiveContainer />;
  }

  // アクティブなランがない場合はラン開始画面を表示
  return <RunStartContainer />;
};
