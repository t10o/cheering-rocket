import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { env } from "@/config/env";
import { fetchCheerSession, postCheerMessage } from "@/services/cheer";
import type {
  CheerMessage,
  CheerSession,
  PostCheerMessagePayload,
  RunnerSnapshot,
} from "@/types/cheer";

type LoadReason = "initial" | "poll" | "manual";

type UseCheerSessionOptions = {
  autoStart?: boolean;
};

type PostMessageOptions = {
  onSuccess?: () => void;
};

const toErrorMessage = (error: unknown) => {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "不明なエラーが発生しました";
};

export const useCheerSession = (
  eventId: string,
  options: UseCheerSessionOptions = {},
) => {
  const { autoStart = true } = options;

  const [session, setSession] = useState<CheerSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPosting, setIsPosting] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const cursorRef = useRef<string | undefined>(undefined);
  const timerRef = useRef<number | null>(null);
  const latestEventIdRef = useRef(eventId);
  const persistedDataRef = useRef<{
    runners: RunnerSnapshot[];
    messages: CheerMessage[];
  }>({ runners: [], messages: [] });

  const persistSessionData = useCallback(
    (incoming: CheerSession): CheerSession => {
      const previous = persistedDataRef.current;

      const nextRunners =
        incoming.runners.length > 0 || previous.runners.length === 0
          ? incoming.runners
          : previous.runners;

      const nextMessages =
        incoming.messages.length > 0 || previous.messages.length === 0
          ? incoming.messages
          : previous.messages;

      persistedDataRef.current = {
        runners: nextRunners,
        messages: nextMessages,
      };

      if (
        nextRunners === incoming.runners &&
        nextMessages === incoming.messages
      ) {
        return incoming;
      }

      return {
        ...incoming,
        runners: nextRunners,
        messages: nextMessages,
      };
    },
    [],
  );

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const load = useCallback(
    async (reason: LoadReason = "poll") => {
      if (!eventId) return;

      if (reason === "initial") {
        setLoading(true);
      }

      if (reason === "poll") {
        setIsPolling(true);
      }

      try {
        const requestPayload = cursorRef.current
          ? { eventId, cursor: cursorRef.current }
          : { eventId };
        const response = await fetchCheerSession(requestPayload);
        cursorRef.current = response.cursor;
        const persistedSession = persistSessionData(response.session);
        setSession(persistedSession);
        setError(null);
      } catch (fetchError) {
        const message = toErrorMessage(fetchError);
        setError(message);
      } finally {
        if (reason === "initial") {
          setLoading(false);
        }
        if (reason === "poll") {
          setIsPolling(false);
        }
      }
    },
    [eventId, persistSessionData],
  );

  useEffect(() => {
    latestEventIdRef.current = eventId;
    cursorRef.current = undefined;
    persistedDataRef.current = { runners: [], messages: [] };

    if (!autoStart) return undefined;

    setSession(null);
    setError(null);

    void load("initial");

    clearTimer();
    timerRef.current = window.setInterval(() => {
      void load("poll");
    }, env.pollingIntervalMs);

    return () => {
      clearTimer();
    };
  }, [eventId, autoStart, clearTimer, load]);

  const postMessage = useCallback(
    async (
      payload: Omit<PostCheerMessagePayload, "eventId">,
      options?: PostMessageOptions,
    ) => {
      if (!latestEventIdRef.current) {
        throw new Error("イベントIDが指定されていません");
      }

      setIsPosting(true);
      try {
        await postCheerMessage({
          eventId: latestEventIdRef.current,
          ...payload,
        });
        await load("manual");
        options?.onSuccess?.();
      } catch (postError) {
        setError(toErrorMessage(postError));
        throw postError;
      } finally {
        setIsPosting(false);
      }
    },
    [load],
  );

  const runnerOptions = useMemo(
    () =>
      session?.runners.map((runner) => {
        const base = {
          label: runner.profile.displayName || "ランナー",
          value: runner.profile.runId,
        };
        return runner.profile.photoUrl
          ? { ...base, photoUrl: runner.profile.photoUrl }
          : base;
      }) ?? [],
    [session?.runners],
  );

  const allRunnersFinished = useMemo(() => {
    const currentRunners = session?.runners ?? [];
    if (currentRunners.length === 0) return false;
    return currentRunners.every((runner) => !runner.isActive);
  }, [session?.runners]);

  return {
    session,
    runners: session?.runners ?? [],
    messages: session?.messages ?? [],
    loading,
    error,
    isPosting,
    isPolling,
    reload: () => load("manual"),
    postMessage,
    runnerOptions,
    allRunnersFinished,
  };
};
