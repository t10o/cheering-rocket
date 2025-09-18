import { useEffect, useMemo, useState } from "react";

import { Button, LoadingSpinner } from "@cheering/ui";

import { CheerChat } from "@/components/chat/CheerChat";
import { RunnerMap } from "@/components/map/RunnerMap";
import { RunnerSummaryList } from "@/components/shared/RunnerSummaryList";
import { useCheerSession } from "@/hooks/useCheerSession";
import type { CheerMessage } from "@/types/cheer";
import { colorForId } from "@/utils/color";

export type CheerPageProps = {
  eventId: string;
};

const groupMessages = (messages: CheerMessage[]) =>
  [...messages].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  );

export const CheerPage = ({ eventId }: CheerPageProps) => {
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const {
    session,
    runners,
    messages,
    loading,
    error,
    isPosting,
    runnerOptions,
    postMessage,
    isPolling,
    reload,
    allRunnersFinished,
  } = useCheerSession(eventId);

  useEffect(() => {
    if (session?.eventName) {
      document.title = `${session.eventName} | Cheer`;
    } else {
      document.title = "Cheer Session";
    }
  }, [session?.eventName]);

  useEffect(() => {
    const hasSelectedRunner = runners.some(
      (runner) => runner.profile.runId === selectedRunId,
    );
    if (!hasSelectedRunner && runners.length > 0) {
      const fallbackRunId = runners[0]?.profile.runId;
      if (fallbackRunId) {
        setSelectedRunId(fallbackRunId);
      }
    }
  }, [runners, selectedRunId]);

  const sortedMessages = useMemo(() => groupMessages(messages), [messages]);
  const selectedRunner = useMemo(
    () =>
      runners.find((runner) => runner.profile.runId === selectedRunId) ?? null,
    [runners, selectedRunId],
  );

  const finisherNames = useMemo(() => {
    if (!allRunnersFinished) return [];
    return runners
      .map((runner) => runner.profile.displayName || "ランナー")
      .filter(Boolean);
  }, [allRunnersFinished, runners]);

  const finisherListText = useMemo(() => {
    if (finisherNames.length === 0) return "全員";
    if (typeof Intl !== "undefined" && "ListFormat" in Intl) {
      const formatter = new Intl.ListFormat("ja-JP", {
        style: "long",
        type: "conjunction",
      });
      return formatter.format(finisherNames);
    }
    return finisherNames.join("、");
  }, [finisherNames]);

  const handleSubmit = async (payload: {
    senderName: string;
    message: string;
    runId?: string;
  }) => {
    await postMessage(payload);
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-white via-marathon-50/40 to-finish-50/30">
      <header className="w-full border-b border-white/60 bg-white/70 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-6 py-8 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-marathon-500">
              Cheer Session
            </p>
            <h1 className="mt-1 text-3xl font-bold text-gray-900">
              {session?.eventName || "応援イベント"}
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              イベントID: <span className="font-mono text-gray-700">{eventId}</span>
            </p>
          </div>
          <div className="flex items-center gap-4">
            {isPolling ? (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <LoadingSpinner size="sm" />
                <span>最新情報を取得しています...</span>
              </div>
            ) : session ? (
              <p className="text-xs text-gray-500">
                最終更新: {new Date(session.updatedAt).toLocaleTimeString("ja-JP", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </p>
            ) : null}
            <Button variant="secondary" onClick={() => reload()}>
              再読み込み
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-6 py-8">
        {loading && (
          <div className="flex flex-1 items-center justify-center rounded-3xl border border-dashed border-gray-200 bg-white/60 text-gray-500">
            <div className="flex items-center gap-2">
              <LoadingSpinner size="md" />
              <span>応援ページを準備しています...</span>
            </div>
          </div>
        )}

        {error && !loading && (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
            <p>データの取得中にエラーが発生しました: {error}</p>
            <Button className="mt-4" variant="primary" onClick={() => reload()}>
              リトライ
            </Button>
          </div>
        )}

        {!loading && !error && (
          <div className="grid gap-6 lg:grid-cols-[1.8fr_1fr]">
            <section className="space-y-6">
              {allRunnersFinished && (
                <div className="rounded-3xl border border-amber-200 bg-amber-50/90 p-6 shadow-lg">
                  <p className="text-sm uppercase tracking-[0.3em] text-amber-600">
                    Congratulations
                  </p>
                  <h2 className="mt-2 text-2xl font-bold text-amber-800">
                    {finisherListText} さん、完走おめでとうございます！
                  </h2>
                  <p className="mt-3 text-sm text-amber-700">
                    最後まで走り抜いたみなさんの軌跡はこのまま表示されます。応援メッセージも引き続き残しておけるので、完走の余韻をみんなで分かち合いましょう。
                  </p>
                </div>
              )}

              <RunnerMap
                runners={runners}
                selectedRunId={selectedRunner?.profile.runId ?? null}
                onSelectRunner={(runId) => setSelectedRunId(runId)}
              />

              <div className="rounded-3xl bg-white/80 p-6 shadow-lg">
                <header className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">ランナーの状況</h2>
                  {selectedRunner && (
                    <p className="text-sm text-gray-500">
                      現在フォーカス中: {selectedRunner.profile.displayName}
                    </p>
                  )}
                </header>
                <RunnerSummaryList
                  runners={runners}
                  selectedRunId={selectedRunner?.profile.runId ?? null}
                  onSelect={(runId) => setSelectedRunId(runId)}
                  getColor={(runId) => colorForId(runId) || "#F97316"}
                />
              </div>
            </section>

            <aside>
              <CheerChat
                messages={sortedMessages}
                runnerOptions={runnerOptions}
                onSubmit={handleSubmit}
                isPosting={isPosting}
              />
            </aside>
          </div>
        )}
      </main>
    </div>
  );
};
