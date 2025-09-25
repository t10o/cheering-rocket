import { useCallback, useEffect, useRef, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { Geolocation, type GeolocationPosition } from "@capacitor/geolocation";
import { LocalNotifications } from "@capacitor/local-notifications";
import {
  addDoc,
  collection,
  getFirestore,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";

import { firebaseApp } from "../../../libs/firebase";

import { captureException } from "@/libs/sentry";

export type BackgroundLocationTrackingState = {
  isTracking: boolean;
  currentLocation: GeolocationPosition | null;
  error: string | null;
  permissionGranted: boolean;
};

export const useBackgroundLocationTracking = () => {
  const [state, setState] = useState<BackgroundLocationTrackingState>({
    isTracking: false,
    currentLocation: null,
    error: null,
    permissionGranted: false,
  });

  const watchIdRef = useRef<string | null>(null);
  const db = getFirestore(firebaseApp);

  // 位置情報の権限を確認・要求
  const requestPermissions = useCallback(async () => {
    try {
      const permissions = await Geolocation.requestPermissions();
      const granted = permissions.location === "granted";

      setState((prev) => ({ ...prev, permissionGranted: granted }));

      if (!granted) {
        setState((prev) => ({
          ...prev,
          error: "位置情報の権限が必要です。設定から権限を許可してください。",
        }));
      }

      return granted;
    } catch (error) {
      console.error("位置情報権限の要求エラー:", error);
      captureException(error, "位置情報権限の要求エラー");
      setState((prev) => ({
        ...prev,
        error: "位置情報の権限要求に失敗しました",
      }));
      return false;
    }
  }, []);

  // 位置情報をFirestoreに保存
  const saveLocationPoint = useCallback(
    async (runId: string, position: GeolocationPosition) => {
      try {
        const isFiniteNumber = (value: number | null | undefined) =>
          typeof value === "number" && Number.isFinite(value);

        const clientTimestamp = isFiniteNumber(position.timestamp)
          ? position.timestamp
          : Date.now();

        if (Capacitor.isNativePlatform()) {
          return;
        }

        const locationPoint: Record<string, unknown> = {
          runId,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: Timestamp.fromMillis(clientTimestamp),
          recordedAt: serverTimestamp(),
          clientTimestamp,
        };

        if (isFiniteNumber(position.coords.altitude)) {
          locationPoint.altitude = position.coords.altitude ?? undefined;
        }

        if (isFiniteNumber(position.coords.speed)) {
          locationPoint.speed = position.coords.speed ?? undefined;
        }

        if (isFiniteNumber(position.coords.heading)) {
          locationPoint.heading = position.coords.heading ?? undefined;
        }

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
      if (!state.permissionGranted) {
        const granted = await requestPermissions();
        if (!granted) return false;
      }

      try {
        // バックグラウンドでの位置情報監視を開始
        const watchId = await Geolocation.watchPosition(
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          },
          async (position) => {
            setState((prev) => ({
              ...prev,
              currentLocation: position,
              error: null,
            }));

            // 位置情報をFirestoreに保存
            if (position) {
              await saveLocationPoint(runId, position);
            }
          },
        );

        watchIdRef.current = watchId;
        setState((prev) => ({ ...prev, isTracking: true }));

        // 通知権限を要求
        await LocalNotifications.requestPermissions();

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
    [state.permissionGranted, requestPermissions, saveLocationPoint],
  );

  // バックグラウンド位置情報の監視を停止
  const stopTracking = useCallback(async () => {
    if (watchIdRef.current) {
      try {
        await Geolocation.clearWatch({ id: watchIdRef.current });
        watchIdRef.current = null;
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

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (watchIdRef.current) {
        Geolocation.clearWatch({ id: watchIdRef.current }).catch(console.error);
      }
    };
  }, []);

  return {
    ...state,
    requestPermissions,
    startTracking,
    stopTracking,
  };
};
