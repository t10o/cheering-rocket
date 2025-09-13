import { useEffect, useState, useMemo } from "react";
import {
  collectionGroup,
  getDocs,
  getDoc,
  getFirestore,
  query,
  where,
  DocumentReference,
} from "firebase/firestore";
import { firebaseApp } from "../../../libs/firebase";
import { useAuth } from "../../auth/hooks/useAuth";
import type { Event } from "../types";

export const useEvents = () => {
  const { user } = useAuth();
  const db = useMemo(() => getFirestore(firebaseApp), []);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchEvents = async () => {
      setLoading(true);
      setError(null);

      try {
        // 自分の members を collectionGroup で取得
        const membersQ = query(
          collectionGroup(db, "members"),
          where("uid", "==", user.uid),
        );

        const snap = await getDocs(membersQ);

        // 親 events/{eventId} を取得
        const eventRefs = snap.docs
          .map((m) => m.ref.parent.parent as DocumentReference | null)
          .filter((r): r is DocumentReference => !!r);

        const evs: Event[] = [];
        for (const ref of eventRefs) {
          try {
            const s = await getDoc(ref);
            const data = s.data() as any;
            if (!data) continue;
            evs.push({
              id: s.id,
              name: data.name ?? "",
              plannedAt: data.plannedAt ?? null,
              note: data.note ?? "",
              ownerUid: data.ownerUid ?? "",
              createdAt: data.createdAt,
              updatedAt: data.updatedAt,
            });
          } catch (err) {
            // 読めないイベント（権限切れ等）はスキップ
            console.warn("[events] read denied:", ref.path, err);
          }
        }

        evs.sort(
          (a, b) =>
            (b.plannedAt?.toMillis?.() || 0) - (a.plannedAt?.toMillis?.() || 0),
        );
        setEvents(evs);
      } catch (err: any) {
        setError(err?.message ?? "イベントの取得に失敗しました");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [db, user]);

  return {
    events,
    loading,
    error,
    refetch: () => {
      if (user) {
        // 再取得のロジック
        setLoading(true);
        // 実際の再取得処理は省略（必要に応じて実装）
      }
    },
  };
};
