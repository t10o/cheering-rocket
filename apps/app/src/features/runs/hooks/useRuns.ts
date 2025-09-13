import { useEffect, useState, useMemo } from "react";
import {
  collection,
  getDocs,
  getFirestore,
  query,
  orderBy,
  limit,
  where,
} from "firebase/firestore";
import { firebaseApp } from "../../../libs/firebase";
import { useAuth } from "../../auth/hooks/useAuth";
import type { Run, RunStats } from "../types";

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
        const runsRef = collection(db, "runs");
        const q = query(
          runsRef,
          where("userId", "==", user.uid),
          orderBy("date", "desc"),
          limit(50),
        );

        const snapshot = await getDocs(q);
        const runsData: Run[] = [];

        snapshot.forEach((doc) => {
          const data = doc.data() as any;
          runsData.push({
            id: doc.id,
            ...data,
          });
        });

        setRuns(runsData);
      } catch (err: any) {
        setError(err?.message ?? "ランレコードの取得に失敗しました");
      } finally {
        setLoading(false);
      }
    };

    fetchRuns();
  }, [db, user]);

  const stats: RunStats = useMemo(() => {
    if (runs.length === 0) {
      return {
        totalDistance: 0,
        totalRuns: 0,
        averagePace: 0,
        bestPace: 0,
        totalTime: 0,
      };
    }

    const totalDistance = runs.reduce((sum, run) => sum + run.distance, 0);
    const totalRuns = runs.length;
    const totalTime = runs.reduce((sum, run) => sum + run.duration, 0);
    const averagePace = totalTime / totalDistance;
    const bestPace = Math.min(...runs.map((run) => run.pace));

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
