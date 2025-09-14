import { useEffect, useState } from "react";
import {
  collectionGroup,
  DocumentReference,
  getDoc,
  getDocs,
  getFirestore,
  query,
  where,
} from "firebase/firestore";

import { firebaseApp } from "../../../libs/firebase";
import { useAuth } from "../../auth/hooks/useAuth";
import type { Event } from "../../events/types";

import { captureException } from "@/libs/sentry";

export const useTodayEvents = () => {
  const { user } = useAuth();
  const db = getFirestore(firebaseApp);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchTodayEvents = async () => {
      setLoading(true);
      setError(null);

      try {
        // 今日の日付を取得
        const today = new Date();
        const startOfDay = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate(),
        );
        const endOfDay = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate() + 1,
        );

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

        const eventsData: Event[] = [];
        for (const ref of eventRefs) {
          try {
            const s = await getDoc(ref);
            const data = s.data();
            if (!data) continue;

            const eventData = data as Event;

            // 当日のイベントのみをフィルター
            if (eventData.plannedAt) {
              const eventDate = eventData.plannedAt.toDate();
              if (eventDate >= startOfDay && eventDate < endOfDay) {
                eventsData.push({
                  id: s.id,
                  name: eventData.name ?? "",
                  plannedAt: eventData.plannedAt,
                  note: eventData.note ?? "",
                  ownerUid: eventData.ownerUid ?? "",
                  ...(eventData.createdAt && {
                    createdAt: eventData.createdAt,
                  }),
                  ...(eventData.updatedAt && {
                    updatedAt: eventData.updatedAt,
                  }),
                });
              }
            }
          } catch (err) {
            // 読めないイベント（権限切れ等）はスキップ
            console.warn("[todayEvents] read denied:", ref.path, err);
          }
        }

        // 日時順でソート
        eventsData.sort(
          (a, b) =>
            (a.plannedAt?.toMillis?.() || 0) - (b.plannedAt?.toMillis?.() || 0),
        );

        setEvents(eventsData);
      } catch (err) {
        console.error("当日イベントの取得エラー:", err);
        captureException(err, "当日イベントの取得エラー");
        setError((err as Error)?.message ?? "当日イベントの取得に失敗しました");
      } finally {
        setLoading(false);
      }
    };

    fetchTodayEvents();
  }, [db, user]);

  return {
    events,
    loading,
    error,
    refetch: () => {
      if (user) {
        setLoading(true);
        // 再取得のロジック（必要に応じて実装）
      }
    },
  };
};
