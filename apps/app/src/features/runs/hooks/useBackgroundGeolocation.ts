import { useCallback, useEffect, useRef, useState } from "react";
import { registerPlugin } from "@capacitor/core";
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

  const watcherIdRef = useRef<string | null>(null);
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

  // バックグラウンド位置情報の監視を開始
  const startTracking = useCallback(
    async (runId: string) => {
      try {
        // 通知権限を要求（Android 13+で必要）
        await LocalNotifications.requestPermissions();

        // バックグラウンド位置情報の監視を開始
        const watcherId = await BackgroundGeolocation.addWatcher(
          {
            // バックグラウンドでの位置情報取得を有効にする
            backgroundMessage: "ラン中の位置情報を記録中...",
            backgroundTitle: "CheeringRocket",

            // 権限を自動で要求
            requestPermissions: true,

            // 古い位置情報は不要
            stale: false,

            // 最小距離フィルター（メートル）
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
              // バックグラウンド位置情報取得

              setState((prev) => ({
                ...prev,
                currentLocation: location
                  ? {
                      latitude: location.latitude,
                      longitude: location.longitude,
                      accuracy: location.accuracy,
                      altitude: location.altitude,
                      speed: location.speed,
                      bearing: location.bearing,
                      time: location.time || Date.now(),
                    }
                  : null,
                error: null,
                permissionGranted: true,
              }));

              // 位置情報をFirestoreに保存
              if (location) {
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
        return false;
      }
    },
    [saveLocationPoint],
  );

  // バックグラウンド位置情報の監視を停止
  const stopTracking = useCallback(async () => {
    if (watcherIdRef.current) {
      try {
        await BackgroundGeolocation.removeWatcher({
          id: watcherIdRef.current,
        });
        watcherIdRef.current = null;
        setState((prev) => ({
          ...prev,
          isTracking: false,
          currentLocation: null,
        }));
        return true;
      } catch (error) {
        console.error("バックグラウンド位置情報監視の停止エラー:", error);
        captureException(error, "バックグラウンド位置情報監視の停止エラー");
        return false;
      }
    }
    return true;
  }, []);

  // 設定画面を開く
  const openSettings = useCallback(async () => {
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
      if (watcherIdRef.current) {
        BackgroundGeolocation.removeWatcher({
          id: watcherIdRef.current,
        }).catch(console.error);
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
