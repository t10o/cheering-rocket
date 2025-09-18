import clsx from "clsx";

import type { RunnerSnapshot } from "@/types/cheer";

const formatDistance = (meters?: number) => {
  if (!meters || Number.isNaN(meters)) return "-";
  return `${(meters / 1000).toFixed(2)} km`;
};

const formatUpdatedAt = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "更新時刻不明";
  return date.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
};

type RunnerSummaryListProps = {
  runners: RunnerSnapshot[];
  selectedRunId?: string | null;
  onSelect?: (runId: string) => void;
  getColor: (runId: string) => string;
};

export const RunnerSummaryList = ({
  runners,
  selectedRunId,
  onSelect,
  getColor,
}: RunnerSummaryListProps) => {
  if (runners.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-gray-300 bg-white/70 p-10 text-center text-gray-500">
        まだ走行中のランナーはいません。イベントが開始されるとここに表示されます。
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {runners.map((runner) => {
        const isSelected = selectedRunId === runner.profile.runId;
        const color = getColor(runner.profile.runId);

        return (
          <button
            key={runner.profile.runId}
            type="button"
            onClick={() => onSelect?.(runner.profile.runId)}
            className={clsx(
              "relative flex w-full items-center gap-4 rounded-3xl border px-4 py-4 text-left transition-transform",
              isSelected
                ? "border-marathon-400 bg-marathon-50/70 shadow-xl"
                : "border-white bg-white/90 shadow-lg hover:-translate-y-0.5",
            )}
            aria-pressed={isSelected}
          >
            <div className="relative flex h-14 w-14 items-center justify-center">
              <div
                className="absolute inset-0 rounded-full opacity-30"
                style={{ backgroundColor: color }}
                aria-hidden
              />
              {runner.profile.photoUrl ? (
                <img
                  src={runner.profile.photoUrl}
                  alt={`${runner.profile.displayName}のアイコン`}
                  className="h-12 w-12 rounded-full object-cover"
                  onError={(event) => {
                    event.currentTarget.style.display = "none";
                    const fallback = event.currentTarget.nextElementSibling as HTMLElement | null;
                    if (fallback) fallback.style.display = "flex";
                  }}
                />
              ) : null}
              <div
                className={clsx(
                  "h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-marathon-500 to-finish-400 text-lg font-semibold text-white",
                  runner.profile.photoUrl ? "hidden" : "flex",
                )}
              >
                {runner.profile.displayName?.charAt(0) || "R"}
              </div>
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-gray-900">
                  {runner.profile.displayName || "ランナー"}
                </h3>
                <span
                  className={clsx(
                    "rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
                    runner.isActive
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-gray-200 text-gray-600",
                  )}
                >
                  {runner.isActive ? "Running" : "Rest"}
                </span>
              </div>
              <p className="text-xs text-gray-500">
                最終更新: {formatUpdatedAt(runner.updatedAt)}
              </p>
              <p className="text-sm font-medium text-gray-700">
                累積距離: {formatDistance(runner.totalDistanceMeters)}
              </p>
            </div>
            {isSelected && (
              <span
                className="absolute -top-2 -right-2 rounded-full bg-gradient-to-br from-marathon-400 to-finish-400 px-3 py-1 text-xs font-semibold text-white shadow"
              >
                フォーカス中
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
