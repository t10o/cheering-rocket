import { useCallback, useEffect, useRef, useState } from "react";
import { Capacitor, registerPlugin } from "@capacitor/core";
import { Geolocation as CapacitorGeolocation } from "@capacitor/geolocation";
import { LocalNotifications } from "@capacitor/local-notifications";
import type { BackgroundGeolocationPlugin } from "@capacitor-community/background-geolocation";
import {
  addDoc,
  collection,
  getFirestore,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";

import { firebaseApp } from "../../../libs/firebase";

import { captureException } from "@/libs/sentry";
import { BackgroundPermission } from "@/plugins/backgroundPermission";
import { RunnerLocation } from "@/plugins/runnerLocation";

// BackgroundGeolocationプラグインを登録
const BackgroundGeolocation = registerPlugin<BackgroundGeolocationPlugin>(
  "BackgroundGeolocation",
);
const isNativePlatform = Capacitor.isNativePlatform();

export type BackgroundLocationTrackingState = {
  isTracking: boolean;
  currentLocation: {
    latitude: number;
    longitude: number;
    accuracy: number;
    altitude: number | null;
    speed: number | null;
    bearing: number | null;
    time: number;
  } | null;
  error: string | null;
  permissionGranted: boolean;
};

export const useBackgroundGeolocation = () => {
  const [state, setState] = useState<BackgroundLocationTrackingState>({
    isTracking: false,
    currentLocation: null,
    error: null,
    permissionGranted: false,
  });
  const [backgroundPermission, setBackgroundPermission] = useState<
    "unknown" | "granted" | "denied"
  >(isNativePlatform ? "unknown" : "granted");
  const [checkingBackgroundPermission, setCheckingBackgroundPermission] =
    useState(false);

  const refreshBackgroundPermission = useCallback(async () => {
    if (!isNativePlatform) {
      setBackgroundPermission("granted");
      return true;
    }

    setCheckingBackgroundPermission(true);
    try {
      const result = await BackgroundPermission.check();
      setBackgroundPermission(
        result.hasBackgroundPermission ? "granted" : "denied",
      );
      return result.hasBackgroundPermission;
    } catch (error) {
      captureException(error, "Background permission check error");
      setBackgroundPermission("denied");
      return false;
    } finally {
      setCheckingBackgroundPermission(false);
    }
  }, []);

  useEffect(() => {
    void refreshBackgroundPermission();
  }, [refreshBackgroundPermission]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        void refreshBackgroundPermission();
      }
    };

    window.addEventListener("focus", handleVisibility);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.removeEventListener("focus", handleVisibility);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [refreshBackgroundPermission]);

  const watcherIdRef = useRef<string | number | null>(null);
  const nativeRunIdRef = useRef<string | null>(null);
  const db = getFirestore(firebaseApp);

  // 位置情報をFirestoreに保存
  const saveLocationPoint = useCallback(
    async (
      runId: string,
      location: {
        latitude: number;
        longitude: number;
        accuracy: number;
        altitude?: number | undefined;
        speed?: number | undefined;
        bearing?: number | undefined;
        time: number;
      },
    ) => {
      if (!runId) return;
      if (isNativePlatform) {
        return;
      }

      try {
        const isFiniteNumber = (value: number | null | undefined) =>
          typeof value === "number" && Number.isFinite(value);

        const clientTimestamp = isFiniteNumber(location.time)
          ? (location.time as number)
          : Date.now();

        const locationPoint: Record<string, unknown> = {
          runId,
          latitude: location.latitude,
          longitude: location.longitude,
          accuracy: location.accuracy,
          timestamp: Timestamp.fromMillis(clientTimestamp),
          recordedAt: serverTimestamp(),
          clientTimestamp,
        };

        if (isFiniteNumber(location.altitude)) {
          locationPoint.altitude = location.altitude;
        }

        if (isFiniteNumber(location.speed)) {
          locationPoint.speed = location.speed;
        }

        if (isFiniteNumber(location.bearing)) {
          locationPoint.heading = location.bearing;
        }

        await addDoc(collection(db, "locationPoints"), locationPoint);
      } catch (error) {
        console.error("位置情報の保存エラー:", error);
        captureException(error, "位置情報の保存エラー");
      }
    },
    [db],
  );

  useEffect(() => {
    if (!isNativePlatform) {
      return;
    }

    let active = true;
    const subscription = RunnerLocation.addListener(
      "locationUpdate",
      (payload) => {
        if (!active) return;
        const runId = nativeRunIdRef.current;
        if (!runId) return;

        const latitude = Number(payload.latitude);
        const longitude = Number(payload.longitude);
        const accuracy = Number(payload.accuracy ?? 0);
        const altitude = payload.altitude as number | null | undefined;
        const speed = payload.speed as number | null | undefined;
        const heading = payload.heading as number | null | undefined;
        const clientTimestamp = Number(payload.clientTimestamp ?? Date.now());

        setState((prev) => ({
          ...prev,
          currentLocation: {
            latitude,
            longitude,
            accuracy,
            altitude: altitude ?? null,
            speed: speed ?? null,
            bearing: heading ?? null,
            time: clientTimestamp,
          },
          error: null,
          permissionGranted: true,
        }));

        void saveLocationPoint(runId, {
          latitude,
          longitude,
          accuracy,
          altitude: altitude ?? undefined,
          speed: speed ?? undefined,
          bearing: heading ?? undefined,
          time: clientTimestamp,
        });
      },
    );

    return () => {
      active = false;
      subscription.then((handle) => handle.remove()).catch(console.error);
    };
  }, [saveLocationPoint]);

  const startBrowserTracking = useCallback(
    async (runId: string) => {
      if (
        typeof navigator === "undefined" ||
        !("geolocation" in navigator) ||
        !navigator.geolocation
      ) {
        setState((prev) => ({
          ...prev,
          error: "このデバイスでは位置情報がサポートされていません",
        }));
        return false;
      }

      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          setState((prev) => ({
            ...prev,
            isTracking: true,
            permissionGranted: true,
            error: null,
            currentLocation: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
              altitude: position.coords.altitude ?? null,
              speed: position.coords.speed ?? null,
              bearing: position.coords.heading ?? null,
              time: position.timestamp,
            },
          }));

          saveLocationPoint(runId, {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude ?? undefined,
            speed: position.coords.speed ?? undefined,
            bearing: position.coords.heading ?? undefined,
            time: position.timestamp,
          }).catch((error) => {
            console.error("ブラウザ位置情報の保存エラー:", error);
            captureException(error, "ブラウザ位置情報の保存エラー");
          });
        },
        (geoError) => {
          console.error("ブラウザ位置情報の取得エラー:", geoError);
          captureException(geoError, "ブラウザ位置情報の取得エラー");

          setState((prev) => ({
            ...prev,
            error:
              geoError.code === geoError.PERMISSION_DENIED
                ? "位置情報の権限を許可してください"
                : "位置情報の取得に失敗しました",
            permissionGranted:
              geoError.code === geoError.PERMISSION_DENIED
                ? false
                : prev.permissionGranted,
          }));

          if (geoError.code === geoError.PERMISSION_DENIED) {
            navigator.geolocation.clearWatch(watchId);
            watcherIdRef.current = null;
            setState((prev) => ({
              ...prev,
              isTracking: false,
              currentLocation: null,
            }));
          }
        },
        {
          enableHighAccuracy: true,
          maximumAge: 5000,
          timeout: 10000,
        },
      );

      watcherIdRef.current = watchId;
      setState((prev) => ({ ...prev, isTracking: true }));
      return true;
    },
    [saveLocationPoint],
  );

  // バックグラウンド位置情報の監視を開始
  const startTracking = useCallback(
    async (runId: string) => {
      if (!isNativePlatform) {
        return startBrowserTracking(runId);
      }

      try {
        await LocalNotifications.requestPermissions();
        nativeRunIdRef.current = runId;
        setState((prev) => ({
          ...prev,
          isTracking: true,
          error: null,
          permissionGranted: backgroundPermission === "granted",
        }));
        return true;
      } catch (error) {
        console.error("バックグラウンド位置情報監視の開始エラー:", error);
        captureException(error, "バックグラウンド位置情報監視の開始エラー");
        setState((prev) => ({
          ...prev,
          error: "バックグラウンド位置情報の監視開始に失敗しました",
        }));

        return startBrowserTracking(runId);
      }
    },
    [saveLocationPoint, startBrowserTracking],
  );

  const recordInitialLocation = useCallback(
    async (runId: string) => {
      if (isNativePlatform) {
        return true;
      }
      try {
        const position = await CapacitorGeolocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 10000,
        });

        const clientTimestamp = position.timestamp ?? Date.now();

        setState((prev) => ({
          ...prev,
          currentLocation: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude ?? null,
            speed: position.coords.speed ?? null,
            bearing: position.coords.heading ?? null,
            time: clientTimestamp,
          },
        }));

        await saveLocationPoint(runId, {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude ?? undefined,
          speed: position.coords.speed ?? undefined,
          bearing: position.coords.heading ?? undefined,
          time: clientTimestamp,
        });

        return true;
      } catch (error) {
        console.error("初回位置情報の取得に失敗しました", error);
        captureException(error, "Initial location fetch error");
        return false;
      }
    },
    [saveLocationPoint],
  );

  // バックグラウンド位置情報の監視を停止
  const stopTracking = useCallback(async () => {
    if (watcherIdRef.current === null) {
      if (isNativePlatform) {
        nativeRunIdRef.current = null;
        setState((prev) => ({
          ...prev,
          isTracking: false,
          currentLocation: null,
        }));
        return true;
      }
      return true;
    }

    if (typeof watcherIdRef.current === "string" && isNativePlatform) {
      try {
        await BackgroundGeolocation.removeWatcher({
          id: watcherIdRef.current,
        });
      } catch (error) {
        console.error("バックグラウンド位置情報監視の停止エラー:", error);
        captureException(error, "バックグラウンド位置情報監視の停止エラー");
        return false;
      }
    }

    if (
      typeof watcherIdRef.current === "number" &&
      typeof navigator !== "undefined" &&
      navigator.geolocation
    ) {
      navigator.geolocation.clearWatch(watcherIdRef.current);
    }

    watcherIdRef.current = null;
    setState((prev) => ({
      ...prev,
      isTracking: false,
      currentLocation: null,
    }));
    return true;
  }, []);

  // 設定画面を開く
  const openSettings = useCallback(async () => {
    if (!isNativePlatform) {
      setState((prev) => ({
        ...prev,
        error: "設定画面はモバイルアプリでのみ利用できます",
      }));
      return;
    }

    try {
      await BackgroundGeolocation.openSettings();
    } catch (error) {
      console.error("設定画面の表示エラー:", error);
      captureException(error, "設定画面の表示エラー");
    }
  }, []);

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (watcherIdRef.current !== null) {
        if (typeof watcherIdRef.current === "string" && isNativePlatform) {
          BackgroundGeolocation.removeWatcher({
            id: watcherIdRef.current,
          }).catch(console.error);
        }
        if (
          typeof watcherIdRef.current === "number" &&
          typeof navigator !== "undefined" &&
          navigator.geolocation
        ) {
          navigator.geolocation.clearWatch(watcherIdRef.current);
        }
      }
    };
  }, []);

  return {
    ...state,
    startTracking,
    stopTracking,
    openSettings,
    hasBackgroundPermission: backgroundPermission === "granted",
    backgroundPermissionStatus: backgroundPermission,
    checkingBackgroundPermission,
    refreshBackgroundPermission,
    recordInitialLocation,
  };
};
