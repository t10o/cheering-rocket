import { useCallback, useEffect, useRef, useState } from "react";
import { Capacitor, type PluginListenerHandle } from "@capacitor/core";
import { Preferences } from "@capacitor/preferences";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  getFirestore,
  limit,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";

import { firebaseApp } from "../../../libs/firebase";
import { getDevicePushToken } from "../../../libs/pushNotifications";
import { useAuth } from "../../auth/hooks/useAuth";
import { calculateSegmentDistanceMeters } from "../functions/distance";
import type { CheerMessage, LocationPoint, Run, RunStatus } from "../types";

import { useBackgroundGeolocation } from "./useBackgroundGeolocation";

import { captureException } from "@/libs/sentry";
import { RunnerLocation } from "@/plugins/runnerLocation";

export type ActiveRun = {
  run: Run;
  locations: LocationPoint[];
  cheerMessages: CheerMessage[];
};

const POLLING_INTERVAL_MS = 15000;
const RUN_ID_PREFERENCE_KEY = "runnerLocation.currentRunId";
const LAST_LAT_PREF_KEY = "runnerLocation.lastLat";
const LAST_LNG_PREF_KEY = "runnerLocation.lastLng";
const BACKGROUND_MIN_DISTANCE = 10;

export const useRunManager = () => {
  const { user } = useAuth();
  const db = getFirestore(firebaseApp);
  const locationTracking = useBackgroundGeolocation();
  const isNativePlatform = Capacitor.isNativePlatform();

  const activeRunIdRef = useRef<string | null>(null);
  const currentRunIdRef = useRef<string | null>(null);
  const nativeRestartPromiseRef = useRef<Promise<void> | null>(null);
  const lastNativeRestartAtRef = useRef(0);
  const runnerStatusListenerRef = useRef<PluginListenerHandle | null>(null);

  const [activeRun, setActiveRun] = useState<ActiveRun | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startNativeBackgroundTracking = useCallback(
    async (runId: string) => {
      if (!user) {
        return false;
      }

      try {
        const tokenResult = await user.getIdTokenResult(true);
        const idToken = tokenResult.token;
        const refreshToken = user.refreshToken || null;
        const expirationTime = tokenResult.expirationTime
          ? new Date(tokenResult.expirationTime).getTime()
          : Date.now() + 55 * 60 * 1000;

        const projectId = firebaseApp.options.projectId;
        const apiKey = firebaseApp.options.apiKey;

        if (!projectId || !apiKey) {
          throw new Error("Firebase project configuration is missing");
        }

        await Preferences.set({ key: RUN_ID_PREFERENCE_KEY, value: runId });
        await Preferences.remove({ key: LAST_LAT_PREF_KEY });
        await Preferences.remove({ key: LAST_LNG_PREF_KEY });

        const result = await RunnerLocation.start({
          runId,
          notificationTitle: "CheeringRocket",
          notificationBody: "ランの位置情報を記録中",
          minimumDistanceMeters: BACKGROUND_MIN_DISTANCE,
          idToken,
          refreshToken,
          idTokenExpiry: expirationTime,
          projectId,
          apiKey,
        });

        return result.started;
      } catch (startError) {
        await Preferences.remove({ key: RUN_ID_PREFERENCE_KEY });
        captureException(startError, "Native background tracking start error");
        return false;
      }
    },
    [user],
  );

  const stopNativeBackgroundTracking = useCallback(async () => {
    try {
      await RunnerLocation.stop();
    } catch (stopError) {
      captureException(stopError, "Native background tracking stop error");
    }

    await Preferences.remove({ key: RUN_ID_PREFERENCE_KEY });
    await Preferences.remove({ key: LAST_LAT_PREF_KEY });
    await Preferences.remove({ key: LAST_LNG_PREF_KEY });
  }, []);

  const ensureNativeTracking = useCallback(() => {
    if (!isNativePlatform) return;
    const runId = activeRunIdRef.current;
    if (!runId) return;

    const now = Date.now();
    if (nativeRestartPromiseRef.current) return;
    if (now - lastNativeRestartAtRef.current < 30_000) return;

    nativeRestartPromiseRef.current = (async () => {
      try {
        const started = await startNativeBackgroundTracking(runId);
        if (!started) {
          console.warn("Failed to restart native background tracking");
        }
      } catch (restartError) {
        captureException(restartError, "Native background tracking auto-restart error");
      } finally {
        lastNativeRestartAtRef.current = Date.now();
        nativeRestartPromiseRef.current = null;
      }
    })();
  }, [isNativePlatform, startNativeBackgroundTracking]);

  // アクティブなランを取得
  useEffect(() => {
    if (!user) return;

    let unsubscribeRun: (() => void) | undefined;
    let pollingTimer: ReturnType<typeof setInterval> | undefined;
    let latestRun: Run | null = null;
    let latestLocations: LocationPoint[] = [];
    let latestMessages: CheerMessage[] = [];

    const updateActiveRun = () => {
      if (!latestRun) return;
      setActiveRun({
        run: latestRun,
        locations: latestLocations,
        cheerMessages: latestMessages,
      });
    };

    const stopPolling = () => {
      if (pollingTimer) {
        clearInterval(pollingTimer);
        pollingTimer = undefined;
      }
    };

    const cleanupChildSubscriptions = () => {
      stopPolling();
      currentRunIdRef.current = null;
      activeRunIdRef.current = null;
      latestLocations = [];
      latestMessages = [];
    };

    const fetchChildData = async (run: Run) => {
      const runId = run.id;
      try {
        const locationsQuery = query(
          collection(db, "locationPoints"),
          where("runId", "==", runId),
        );
        const messagesQuery = query(
          collection(db, "cheerMessages"),
          where("eventId", "==", run.eventId),
        );

        const [locationsSnap, messagesSnap] = await Promise.all([
          getDocs(locationsQuery),
          getDocs(messagesQuery),
        ]);

        latestLocations = locationsSnap.docs
          .map((doc) => {
            const data = doc.data() as Omit<LocationPoint, "id">;
            return {
              id: doc.id,
              ...data,
            } as LocationPoint;
          })
          .sort((a, b) => {
            const aTime =
              a.timestamp instanceof Timestamp ? a.timestamp.toMillis() : 0;
            const bTime =
              b.timestamp instanceof Timestamp ? b.timestamp.toMillis() : 0;
            return aTime - bTime;
          });

        latestMessages = messagesSnap.docs
          .map((doc) => {
            const data = doc.data() as Omit<CheerMessage, "id">;
            return {
              id: doc.id,
              ...data,
            } as CheerMessage;
          })
          .filter((message) =>
            message.runId ? message.runId === runId : true,
          )
          .sort((a, b) => {
            const aTime =
              a.timestamp instanceof Timestamp ? a.timestamp.toMillis() : 0;
            const bTime =
              b.timestamp instanceof Timestamp ? b.timestamp.toMillis() : 0;
            return aTime - bTime;
          });

        updateActiveRun();
      } catch (fetchError) {
        console.error("ランデータの取得エラー:", fetchError);
        captureException(fetchError, "ランデータの取得エラー");
      }
    };

    const startPolling = (run: Run) => {
      stopPolling();
      fetchChildData(run);
      pollingTimer = setInterval(() => {
        fetchChildData(run);
      }, POLLING_INTERVAL_MS);
    };

    const fetchActiveRun = async () => {
      try {
        const runsRef = collection(db, "runs");
        const q = query(
          runsRef,
          where("userId", "==", user.uid),
          where("status", "==", "active"),
          limit(1),
        );

        unsubscribeRun = onSnapshot(q, (snapshot) => {
          if (snapshot.empty) {
            cleanupChildSubscriptions();
            latestRun = null;
            setActiveRun(null);
            void stopNativeBackgroundTracking();
            return;
          }

          const runDoc = snapshot.docs[0];
          if (!runDoc) return;
          const run = { id: runDoc.id, ...runDoc.data() } as Run;

          latestRun = run;
          updateActiveRun();

          if (currentRunIdRef.current === run.id) {
            return;
          }

          cleanupChildSubscriptions();
          currentRunIdRef.current = run.id;
          activeRunIdRef.current = run.id;
          startPolling(run);
        });
      } catch (error) {
        console.error("アクティブランの取得エラー:", error);
        captureException(error, "アクティブランの取得エラー");
        setError("アクティブランの取得に失敗しました");
      }
    };

    fetchActiveRun();

    return () => {
      if (unsubscribeRun) unsubscribeRun();
      stopPolling();
    };
  }, [db, user]);

  useEffect(() => {
    if (!isNativePlatform) {
      return;
    }

    let cancelled = false;

    const initializeStatusListener = async () => {
      try {
        const status = await RunnerLocation.getStatus();
        if (!cancelled && !status.isTracking && status.hasBackgroundPermission) {
          ensureNativeTracking();
        }
      } catch (statusError) {
        captureException(statusError, "RunnerLocation status check error");
      }

      try {
        const listener = await RunnerLocation.addListener("status", (status) => {
          if (!status.isTracking && status.hasBackgroundPermission) {
            ensureNativeTracking();
          }
        });

        if (cancelled) {
          await listener.remove();
        } else {
          runnerStatusListenerRef.current = listener;
        }
      } catch (listenerError) {
        captureException(listenerError, "RunnerLocation status listener error");
      }
    };

    void initializeStatusListener();

    return () => {
      cancelled = true;
      if (runnerStatusListenerRef.current) {
        void runnerStatusListenerRef.current.remove();
        runnerStatusListenerRef.current = null;
      }
    };
  }, [ensureNativeTracking, isNativePlatform]);

  useEffect(() => {
    activeRunIdRef.current = activeRun ? activeRun.run.id : null;
  }, [activeRun]);

  // ランを開始
  const startRun = useCallback(
    async (eventId: string) => {
      if (!user) {
        setError("ユーザーが認証されていません");
        return false;
      }

      setLoading(true);
      setError(null);

      try {
        // 新しいランを作成
        const deviceToken = await getDevicePushToken();

        const runData = {
          userId: user.uid,
          eventId,
          status: "active" as RunStatus,
          distance: 0,
          duration: 0,
          pace: 0,
          date: serverTimestamp(),
          startedAt: serverTimestamp(),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          ...(deviceToken ? { deviceToken } : {}),
        };

        const runRef = await addDoc(collection(db, "runs"), runData);
        const runId = runRef.id;

        if (deviceToken) {
          setDoc(
            doc(db, "users", user.uid),
            { pushToken: deviceToken },
            { merge: true },
          ).catch((tokenError) => {
            console.warn("Failed to persist push token", tokenError);
            captureException(tokenError, "Push token persist error");
          });
        }

        const backgroundStarted = await startNativeBackgroundTracking(runId);

        if (!backgroundStarted) {
          await updateDoc(doc(db, "runs", runId), {
            status: "cancelled",
            updatedAt: serverTimestamp(),
          });
          setError("バックグラウンド位置情報の開始に失敗しました");
          setLoading(false);
          return false;
        }

        // 位置情報の追跡を開始（アプリ内表示用）
        const trackingStarted = await locationTracking.startTracking(runId);

        if (!trackingStarted) {
          // 位置情報追跡に失敗した場合、ランを削除
          await updateDoc(doc(db, "runs", runId), {
            status: "cancelled",
            updatedAt: serverTimestamp(),
          });
          await stopNativeBackgroundTracking();
          setError("位置情報の追跡開始に失敗しました");
          setLoading(false);
          return false;
        }

        void locationTracking.recordInitialLocation?.(runId);

        setLoading(false);
        return true;
      } catch (error) {
        console.error("ランの開始エラー:", error);
        captureException(error, "ランの開始エラー");
        setError("ランの開始に失敗しました");
        setLoading(false);
        return false;
      }
    },
    [user, db, locationTracking],
  );

  // ランを終了
  const endRun = useCallback(
    async (confirmationText: string) => {
      if (!activeRun) {
        setError("アクティブなランが見つかりません");
        return false;
      }

      if (confirmationText !== "終了") {
        setError("「終了」と入力してください");
        return false;
      }

      setLoading(true);
      setError(null);

      try {
        // 位置情報の追跡を停止
        await locationTracking.stopTracking();
        await stopNativeBackgroundTracking();

        // 距離と時間を計算
        const locations = activeRun.locations;
        let totalDistance = 0;

        if (locations.length > 1) {
          for (let i = 1; i < locations.length; i++) {
            const prev = locations[i - 1];
            const curr = locations[i];
            if (prev && curr) {
              totalDistance += calculateSegmentDistanceMeters(prev, curr);
            }
          }
        }

        const duration = activeRun.run.startedAt
          ? (Date.now() - activeRun.run.startedAt.toMillis()) / (1000 * 60) // 分
          : 0;

        const pace = totalDistance > 0 ? duration / (totalDistance / 1000) : 0; // 分/km

        // ランを完了状態に更新
        await updateDoc(doc(db, "runs", activeRun.run.id), {
          status: "completed" as RunStatus,
          distance: totalDistance / 1000, // km
          duration,
            pace,
            endedAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });

        setActiveRun(null);
        setLoading(false);
        return true;
      } catch (error) {
        console.error("ランの終了エラー:", error);
        captureException(error, "ランの終了エラー");
        setError("ランの終了に失敗しました");
        setLoading(false);
        return false;
      }
    },
    [activeRun, db, locationTracking],
  );

  return {
    activeRun,
    loading,
    error,
    startRun,
    endRun,
    isTracking: locationTracking.isTracking,
  };
};
