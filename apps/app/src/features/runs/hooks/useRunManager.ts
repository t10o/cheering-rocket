import { useCallback, useEffect, useState } from "react";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  getFirestore,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

import { firebaseApp } from "../../../libs/firebase";
import { useAuth } from "../../auth/hooks/useAuth";
import type { CheerMessage, LocationPoint, Run, RunStatus } from "../types";

import { useBackgroundGeolocation } from "./useBackgroundGeolocation";

import { captureException } from "@/libs/sentry";

export type ActiveRun = {
  run: Run;
  locations: LocationPoint[];
  cheerMessages: CheerMessage[];
};

export const useRunManager = () => {
  const { user } = useAuth();
  const db = getFirestore(firebaseApp);
  const locationTracking = useBackgroundGeolocation();

  const [activeRun, setActiveRun] = useState<ActiveRun | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // アクティブなランを取得
  useEffect(() => {
    if (!user) return;

    let unsubscribe: (() => void) | undefined;

    const fetchActiveRun = async () => {
      try {
        // アクティブなランを検索
        const runsRef = collection(db, "runs");
        const q = query(
          runsRef,
          where("userId", "==", user.uid),
          where("status", "==", "active"),
          limit(1),
        );

        unsubscribe = onSnapshot(q, async (snapshot) => {
          if (snapshot.empty) {
            setActiveRun(null);
            return;
          }

          const runDoc = snapshot.docs[0];
          if (!runDoc) return;
          const run = { id: runDoc.id, ...runDoc.data() } as Run;

          // 位置情報を取得
          const locationsRef = collection(db, "locationPoints");
          const locationsQuery = query(
            locationsRef,
            where("runId", "==", run.id),
            orderBy("timestamp", "asc"),
          );

          const locationsSnapshot = await getDocs(locationsQuery);
          const locations = locationsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as LocationPoint[];

          // 応援メッセージを取得
          const messagesRef = collection(db, "cheerMessages");
          const messagesQuery = query(
            messagesRef,
            where("runId", "==", run.id),
            orderBy("timestamp", "asc"),
          );

          const messagesSnapshot = await getDocs(messagesQuery);
          const cheerMessages = messagesSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as CheerMessage[];

          setActiveRun({
            run,
            locations,
            cheerMessages,
          });
        });
      } catch (error) {
        console.error("アクティブランの取得エラー:", error);
        captureException(error, "アクティブランの取得エラー");
        setError("アクティブランの取得に失敗しました");
      }
    };

    fetchActiveRun();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [db, user]);

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
        };

        const runRef = await addDoc(collection(db, "runs"), runData);
        const runId = runRef.id;

        // 位置情報の追跡を開始
        const trackingStarted = await locationTracking.startTracking(runId);

        if (!trackingStarted) {
          // 位置情報追跡に失敗した場合、ランを削除
          await updateDoc(doc(db, "runs", runId), {
            status: "cancelled",
            updatedAt: serverTimestamp(),
          });
          setError("位置情報の追跡開始に失敗しました");
          setLoading(false);
          return false;
        }

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

        // 距離と時間を計算
        const locations = activeRun.locations;
        let totalDistance = 0;

        if (locations.length > 1) {
          // 簡易的な距離計算（実際のプロダクションではより正確な計算が必要）
          for (let i = 1; i < locations.length; i++) {
            const prev = locations[i - 1];
            const curr = locations[i];
            if (prev && curr) {
              const distance = calculateDistance(
                prev.latitude,
                prev.longitude,
                curr.latitude,
                curr.longitude,
              );
              totalDistance += distance;
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

  // 距離計算のヘルパー関数（Haversine formula）
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number => {
    const R = 6371000; // 地球の半径（メートル）
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  return {
    activeRun,
    loading,
    error,
    startRun,
    endRun,
    isTracking: locationTracking.isTracking,
  };
};
