import { useCallback, useEffect, useRef, useState } from "react";
import { Geolocation, type GeolocationPosition } from "@capacitor/geolocation";
import { LocalNotifications } from "@capacitor/local-notifications";
import {
  addDoc,
  collection,
  getFirestore,
  serverTimestamp,
} from "firebase/firestore";

import { firebaseApp } from "../../../libs/firebase";

import { captureException } from "@/libs/sentry";

export type LocationTrackingState = {
  isTracking: boolean;
  currentLocation: GeolocationPosition | null;
  error: string | null;
  permissionGranted: boolean;
};

export const useLocationTracking = () => {
  const [state, setState] = useState<LocationTrackingState>({
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

  // 現在位置を取得
  const getCurrentPosition = useCallback(async () => {
    try {
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      });

      setState((prev) => ({
        ...prev,
        currentLocation: position,
        error: null,
      }));

      return position;
    } catch (error) {
      console.error("現在位置の取得エラー:", error);
      captureException(error, "現在位置の取得エラー");
      setState((prev) => ({
        ...prev,
        error: "現在位置の取得に失敗しました",
      }));
      return null;
    }
  }, []);

  // 位置情報をFirestoreに保存
  const saveLocationPoint = useCallback(
    async (runId: string, position: GeolocationPosition) => {
      try {
        const locationPoint = {
          runId,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude || undefined,
          speed: position.coords.speed || undefined,
          heading: position.coords.heading || undefined,
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

  // 位置情報の監視を開始
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

        // バックグラウンド実行のための通知権限を要求
        await LocalNotifications.requestPermissions();

        return true;
      } catch (error) {
        console.error("位置情報監視の開始エラー:", error);
        captureException(error, "位置情報監視の開始エラー");
        setState((prev) => ({
          ...prev,
          error: "位置情報の監視開始に失敗しました",
        }));
        return false;
      }
    },
    [state.permissionGranted, requestPermissions, saveLocationPoint],
  );

  // 位置情報の監視を停止
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
        console.error("位置情報監視の停止エラー:", error);
        captureException(error, "位置情報監視の停止エラー");
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
    getCurrentPosition,
    startTracking,
    stopTracking,
  };
};
