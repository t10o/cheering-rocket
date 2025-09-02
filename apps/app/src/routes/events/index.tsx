import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  collectionGroup,
  getDocs,
  getDoc,
  getFirestore,
  query,
  where,
  DocumentReference,
} from "firebase/firestore";
import { firebaseApp } from "@/libs/firebase";
import { useAuth } from "@/hooks/useAuth";
import clsx from "clsx";
import { AppBar } from "@cheering/ui";

export const Route = createFileRoute("/events/")({
  component: EventsIndex,
});

type EventDoc = {
  id: string;
  name: string;
  plannedAt?: any; // Firestore Timestamp 想定
  note?: string;
  ownerUid: string;
};

function EventsIndex() {
  const { user } = useAuth();
  const db = useMemo(() => getFirestore(firebaseApp), []);
  const [events, setEvents] = useState<EventDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    (async () => {
      setLoading(true);
      try {
        // 自分の members を collectionGroup で取得（各 doc に uid フィールドが入っている前提）
        const membersQ = query(
          collectionGroup(db, "members"),
          where("uid", "==", user.uid),
        );

        const snap = await getDocs(membersQ);

        // 親 events/{eventId} を取得
        const eventRefs = snap.docs
          .map((m) => m.ref.parent.parent as DocumentReference | null)
          .filter((r): r is DocumentReference => !!r);

        const evs: EventDoc[] = [];
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
      } finally {
        setLoading(false);
      }
    })();
  }, [db, user]);

  return (
    <div className="min-h-dvh bg-gray-50">
      <AppBar
        bordered
        center={<div>イベント</div>}
        right={
          <div className="flex items-center gap-2">
            <Link
              to="/events/join"
              className="px-3 py-1.5 rounded-xl border border-gray-300 bg-white hover:bg-gray-50"
            >
              参加
            </Link>
            <Link
              to="/events/new"
              className="px-3 py-1.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
            >
              作成
            </Link>
          </div>
        }
      />
      <div className="p-4 space-y-3">
        {loading && <div>Loading...</div>}
        {!loading && events.length === 0 && <Empty />}
        {events.map((e) => (
          <Link
            key={e.id}
            to="/events/$eventId"
            params={{ eventId: e.id }}
            className={card}
          >
            <div className="font-medium">{e.name}</div>
            <div className="text-xs text-gray-500">
              {e.plannedAt?.toDate?.().toLocaleString?.() ?? "日時未設定"}
            </div>
            {e.note && (
              <div className="mt-1 line-clamp-2 text-xs text-gray-600">
                {e.note}
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}

function Empty() {
  return (
    <div className="rounded-2xl border border-dashed p-6 text-center bg-white">
      <div className="text-gray-600">まだイベントがありません。</div>
      <div className="mt-3 flex items-center justify-center gap-2">
        <Link
          to="/events/join"
          className="px-3 py-1.5 rounded-xl border border-gray-300 bg-white hover:bg-gray-50"
        >
          イベントIDで参加
        </Link>
        <Link
          to="/events/new"
          className="px-3 py-1.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
        >
          作成
        </Link>
      </div>
      <p className="mt-2 text-xs text-gray-500">
        参加したいイベントのIDを持っている場合は「イベントIDで参加」から。
      </p>
    </div>
  );
}

const card = clsx(
  "block rounded-2xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition",
);
