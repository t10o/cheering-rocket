import { useEffect, useState } from "react";

import { Button } from "@cheering/ui";

import type { ActiveRun } from "../../hooks/useRunManager";

export type RunActivePresenterProps = {
  activeRun: ActiveRun;
  showEndDialog: boolean;
  confirmationText: string;
  loading: boolean;
  error: string | null;
  onEndRun: () => void;
  onShowEndDialog: () => void;
  onCancelEnd: () => void;
  onConfirmationTextChange: (text: string) => void;
};

export const RunActivePresenter = ({
  activeRun,
  showEndDialog,
  confirmationText,
  loading,
  error,
  onEndRun,
  onShowEndDialog,
  onCancelEnd,
  onConfirmationTextChange,
}: RunActivePresenterProps) => {
  const [elapsedTime, setElapsedTime] = useState(0);

  // 経過時間の計算
  useEffect(() => {
    if (!activeRun.run.startedAt) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const started = activeRun.run.startedAt!.toMillis();
      setElapsedTime(Math.floor((now - started) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [activeRun.run.startedAt]);

  // 経過時間をフォーマット
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  // 簡易的な距離計算（実際のプロダクションではより正確な計算が必要）
  const calculateDistance = () => {
    const locations = activeRun.locations;
    if (locations.length < 2) return 0;

    let totalDistance = 0;
    for (let i = 1; i < locations.length; i++) {
      const prev = locations[i - 1];
      const curr = locations[i];
      if (prev && curr) {
        const distance = calculateDistanceBetweenPoints(
          prev.latitude,
          prev.longitude,
          curr.latitude,
          curr.longitude,
        );
        totalDistance += distance;
      }
    }

    return totalDistance / 1000; // km
  };

  const calculateDistanceBetweenPoints = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number => {
    const R = 6371000; // 地球の半径（メートル）
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const distance = calculateDistance();
  const pace = distance > 0 ? elapsedTime / 60 / distance : 0; // 分/km

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white shadow-sm border-b">
        <div className="p-4">
          <h1 className="text-lg font-semibold text-gray-900">
            {activeRun.run.eventId} のラン
          </h1>
          <p className="text-sm text-gray-600">位置情報を記録中...</p>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="p-4 space-y-6">
        {/* ラン統計 */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-blue-600">
                {formatTime(elapsedTime)}
              </p>
              <p className="text-sm text-gray-600">経過時間</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {distance.toFixed(2)}
              </p>
              <p className="text-sm text-gray-600">距離 (km)</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">
                {pace.toFixed(1)}
              </p>
              <p className="text-sm text-gray-600">ペース (分/km)</p>
            </div>
          </div>
        </div>

        {/* 応援メッセージ */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-4 border-b">
            <h3 className="font-semibold text-gray-900">応援メッセージ</h3>
          </div>
          <div className="p-4">
            {activeRun.cheerMessages.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>まだ応援メッセージはありません</p>
                <p className="text-sm mt-1">
                  Webから応援メッセージが送信されます
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {activeRun.cheerMessages.map((message) => (
                  <div key={message.id} className="flex">
                    <div className="flex-1">
                      <div className="bg-blue-100 rounded-lg p-3 inline-block max-w-xs">
                        <p className="text-sm font-medium text-blue-900">
                          {message.senderName}
                        </p>
                        <p className="text-sm text-blue-800 mt-1">
                          {message.message}
                        </p>
                        <p className="text-xs text-blue-600 mt-1">
                          {message.timestamp
                            .toDate()
                            .toLocaleTimeString("ja-JP")}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 終了ボタン */}
        <div className="pt-4">
          <Button
            onClick={onShowEndDialog}
            className="w-full"
            size="lg"
            variant="destructive"
          >
            ランを終了
          </Button>
        </div>
      </div>

      {/* 終了確認ダイアログ */}
      {showEndDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              ランを終了しますか？
            </h3>

            <p className="text-sm text-gray-600 mb-4">
              終了するには「終了」と入力してください
            </p>

            <input
              type="text"
              value={confirmationText}
              onChange={(e) => onConfirmationTextChange(e.target.value)}
              placeholder="終了"
              className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            <div className="flex space-x-3">
              <Button
                onClick={onCancelEnd}
                variant="outline"
                className="flex-1"
              >
                キャンセル
              </Button>
              <Button
                onClick={onEndRun}
                isDisabled={loading || confirmationText !== "終了"}
                className="flex-1"
                variant="destructive"
              >
                {loading ? "終了中..." : "終了"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
