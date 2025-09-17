import { Button } from "@cheering/ui";

import type { Event } from "../../../events/types";

export type RunStartPresenterProps = {
  events: Event[];
  selectedEventId: string;
  eventsLoading: boolean;
  startLoading: boolean;
  eventsError: string | null;
  startError: string | null;
  hasBackgroundPermission: boolean;
  checkingBackgroundPermission: boolean;
  onEventSelect: (eventId: string) => void;
  onStartRun: () => void;
  onOpenSettings: () => void;
};

export const RunStartPresenter = ({
  events,
  selectedEventId,
  eventsLoading,
  startLoading,
  eventsError,
  startError,
  hasBackgroundPermission,
  checkingBackgroundPermission,
  onEventSelect,
  onStartRun,
  onOpenSettings,
}: RunStartPresenterProps) => {
  if (eventsLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">イベントを読み込み中...</p>
        </div>
      </div>
    );
  }

  if (eventsError) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{eventsError}</p>
        </div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="p-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">
            本日のイベントがありません
          </h3>
          <p className="text-yellow-700">
            ランを開始するには、まず本日のイベントを作成してください。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          ランを開始するイベントを選択
        </h2>

        <div className="space-y-3">
          {events.map((event) => (
            <div
              key={event.id}
              className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                selectedEventId === event.id
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => onEventSelect(event.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onEventSelect(event.id);
                }
              }}
              role="button"
              tabIndex={0}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{event.name}</h3>
                  {event.plannedAt && (
                    <p className="text-sm text-gray-600">
                      {event.plannedAt.toDate().toLocaleTimeString("ja-JP", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  )}
                  {event.note && (
                    <p className="text-sm text-gray-600 mt-1">{event.note}</p>
                  )}
                </div>
                <div
                  className={`w-4 h-4 rounded-full border-2 ${
                    selectedEventId === event.id
                      ? "border-blue-500 bg-blue-500"
                      : "border-gray-300"
                  }`}
                >
                  {selectedEventId === event.id && (
                    <div className="w-full h-full rounded-full bg-white scale-50"></div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {startError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{startError}</p>
        </div>
      )}

      <div className="space-y-4">
        <Button
          onClick={onStartRun}
          isDisabled={
            !selectedEventId ||
            startLoading ||
            checkingBackgroundPermission ||
            !hasBackgroundPermission
          }
          className="w-full"
          size="lg"
        >
          {startLoading
            ? "ランを開始中..."
            : checkingBackgroundPermission
              ? "権限を確認中..."
              : "ランを開始"}
        </Button>

        {!hasBackgroundPermission && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-sm text-orange-800 space-y-2">
            <p>
              バックグラウンドで位置情報を記録するには、端末の設定で
              <strong>「常に許可」</strong>に変更してください。
            </p>
            <p className="text-xs text-orange-700 leading-5">
              「位置情報の設定を開く」&nbsp;→&nbsp;権限&nbsp;→&nbsp;位置情報&nbsp;→&nbsp;常に許可
              <br />設定画面で左上の戻るを繰り返してアプリに戻ってください。
            </p>
            <Button
              onClick={onOpenSettings}
              variant="outline"
              size="sm"
              className="mt-1"
            >
              位置情報の設定を開く
            </Button>
          </div>
        )}

        <div className="text-sm text-gray-600 text-center space-y-2">
          <p>ラン開始後は位置情報が自動的に記録されます</p>
          <p className="text-xs">
            バックグラウンドで位置情報を取得するため、通知が表示されます
          </p>
        </div>
      </div>
    </div>
  );
};
