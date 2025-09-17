import { useCallback, useEffect, useRef, useState } from "react";
import { Capacitor, registerPlugin } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";
import type { BackgroundGeolocationPlugin } from "@capacitor-community/background-geolocation";
import {
  addDoc,
  collection,
  getFirestore,
  serverTimestamp,
} from "firebase/firestore";

import { firebaseApp } from "../../../libs/firebase";

import { captureException } from "@/libs/sentry";

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

  const watcherIdRef = useRef<string | number | null>(null);
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
      try {
        const locationPoint = {
          runId,
          latitude: location.latitude,
          longitude: location.longitude,
          accuracy: location.accuracy,
          altitude: location.altitude || undefined,
          speed: location.speed || undefined,
          heading: location.bearing || undefined,
          timestamp: serverTimestamp(),
        };

        await addDoc(collection(db, "locationPoints"), locationPoint);
      } catch (error) {
        console.error("位置情報の保存エラー:", error);
        captureException(error, "位置情報の保存エラー");
      }
    },
    [db],
  );

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

        const watcherId = await BackgroundGeolocation.addWatcher(
          {
            backgroundMessage: "ラン中の位置情報を記録中...",
            backgroundTitle: "CheeringRocket",
            requestPermissions: true,
            stale: false,
            distanceFilter: 10,
          },
          (location, error) => {
            if (error) {
              console.error("位置情報取得エラー:", error);

              if (error.code === "NOT_AUTHORIZED") {
                setState((prev) => ({
                  ...prev,
                  error:
                    "位置情報の権限が必要です。設定から権限を許可してください。",
                }));
              } else {
                setState((prev) => ({
                  ...prev,
                  error: "位置情報の取得に失敗しました",
                }));
              }
              return;
            }

            if (location) {
              setState((prev) => ({
                ...prev,
                currentLocation: {
                  latitude: location.latitude,
                  longitude: location.longitude,
                  accuracy: location.accuracy,
                  altitude: location.altitude ?? null,
                  speed: location.speed ?? null,
                  bearing: location.bearing ?? null,
                  time: location.time || Date.now(),
                },
                error: null,
                permissionGranted: true,
              }));

              saveLocationPoint(runId, {
                latitude: location.latitude,
                longitude: location.longitude,
                accuracy: location.accuracy,
                altitude: location.altitude ?? undefined,
                speed: location.speed ?? undefined,
                bearing: location.bearing ?? undefined,
                time: location.time || Date.now(),
              });
            }
          },
        );

        watcherIdRef.current = watcherId;
        setState((prev) => ({ ...prev, isTracking: true }));

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

  // バックグラウンド位置情報の監視を停止
  const stopTracking = useCallback(async () => {
    if (watcherIdRef.current === null) {
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
  };
};
