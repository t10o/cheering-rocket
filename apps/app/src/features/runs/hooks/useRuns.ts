import { useEffect, useMemo, useState } from "react";
import {
  collectionGroup,
  getDocs,
  getFirestore,
  limit,
  orderBy,
  query,
  where,
} from "firebase/firestore";

import { firebaseApp } from "../../../libs/firebase";
import { useAuth } from "../../auth/hooks/useAuth";
import type { Run, RunStats } from "../types";

import { captureException } from "@/libs/sentry";

export const useRuns = () => {
  const { user } = useAuth();
  const db = useMemo(() => getFirestore(firebaseApp), []);
  const [runs, setRuns] = useState<Run[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchRuns = async () => {
      setLoading(true);
      setError(null);

      try {
        const runsRef = collectionGroup(db, "runs");
        const q = query(
          runsRef,
          where("userId", "==", user.uid),
          orderBy("date", "desc"),
          limit(50),
        );

        const snapshot = await getDocs(q);
        const runsData: Run[] = [];

        snapshot.forEach((doc) => {
          const data = doc.data() as Omit<Run, "id">;
          runsData.push({
            id: doc.id,
            ...data,
          });
        });

        setRuns(runsData);
      } catch (err) {
        console.error("ランレコードの取得エラー:", err);
        captureException(err, "ランレコードの取得エラー");
        setError((err as Error)?.message ?? "ランレコードの取得に失敗しました");
      } finally {
        setLoading(false);
      }
    };

    fetchRuns();
  }, [db, user]);

  const stats: RunStats = useMemo(() => {
    const completedRuns = runs.filter((run) => run.status === "completed");

    if (completedRuns.length === 0) {
      return {
        totalDistance: 0,
        totalRuns: 0,
        averagePace: 0,
        bestPace: 0,
        totalTime: 0,
      };
    }

    const totalDistance = completedRuns.reduce(
      (sum, run) => sum + (run.distance || 0),
      0,
    );
    const totalRuns = completedRuns.length;
    const totalTime = completedRuns.reduce(
      (sum, run) => sum + (run.duration || 0),
      0,
    );
    const distanceForPace = completedRuns.reduce(
      (sum, run) => sum + (run.distance || 0),
      0,
    );
    const timeForPace = completedRuns.reduce(
      (sum, run) => sum + (run.distance ? run.duration : 0),
      0,
    );
    const averagePace =
      distanceForPace > 0 ? timeForPace / distanceForPace : 0;
    const validPaces = completedRuns
      .map((run) => (run.distance ? run.pace : Infinity))
      .filter((pace) => Number.isFinite(pace) && pace > 0);
    const bestPace = validPaces.length > 0 ? Math.min(...validPaces) : 0;

    return {
      totalDistance,
      totalRuns,
      averagePace,
      bestPace,
      totalTime,
    };
  }, [runs]);

  return {
    runs,
    loading,
    error,
    stats,
    refetch: () => {
      if (user) {
        setLoading(true);
        // 再取得のロジック（必要に応じて実装）
      }
    },
  };
};
