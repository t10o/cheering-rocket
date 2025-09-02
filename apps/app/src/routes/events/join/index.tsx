import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  doc,
  getDoc,
  getFirestore,
  collection,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { firebaseApp } from "@/libs/firebase";
import { useAuth } from "@/hooks/useAuth";
import { AppBar } from "@cheering/ui";

export const Route = createFileRoute("/events/join/")({
  component: JoinEventPage,
});

type EventLite = {
  name: string;
  plannedAt?: any;
  note?: string;
  ownerUid: string;
  joinable?: boolean;
};

function JoinEventPage() {
  const { user } = useAuth();
  const nav = useNavigate();
  const db = useMemo(() => getFirestore(firebaseApp), []);
  const [eventId, setEventId] = useState("");
  const [hit, setHit] = useState<{ id: string; data: EventLite } | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);

  async function search() {
    setErr(null);
    setHit(null);
    const id = eventId.trim();
    if (!id) return;
    setLoading(true);
    try {
      const s = await getDoc(doc(db, "events", id));
      const d = s.data() as EventLite | undefined;
      if (!d || d.joinable === false) {
        setErr("イベントが見つからないか、参加受付が無効になっています。");
        return;
      }
      setHit({ id: s.id, data: d });
    } catch (e: any) {
      setErr("取得に失敗しました");
    } finally {
      setLoading(false);
    }
  }

  async function join() {
    if (!user || !hit) return;
    setJoining(true);
    setErr(null);
    try {
      // すでに参加済みか軽く確認（存在しても setDoc は上書き merge でOK）
      await setDoc(
        doc(collection(db, "events", hit.id, "members"), user.uid),
        {
          uid: user.uid,
          role: "member",
          joinedAt: serverTimestamp(),
          inviterUid: user.uid, // ID参加なので自分を招待者に
        },
        { merge: true },
      );
      // 参加完了 → 詳細へ
      nav({ to: "/events/$eventId", params: { eventId: hit.id } });
    } catch (e: any) {
      setErr("参加に失敗しました");
    } finally {
      setJoining(false);
    }
  }

  const alreadyMember = false; // 必要なら members/{uid} の存在チェックを追加

  return (
    <div className="min-h-dvh bg-gray-50">
      <AppBar
        bordered
        center={<div>イベントIDで参加</div>}
        left={
          <Link to="/events" className="px-2 py-1 rounded-xl hover:bg-gray-100">
            戻る
          </Link>
        }
      />
      <div className="p-4 space-y-4">
        <div className="flex gap-2">
          <input
            className="flex-1 rounded-xl border border-gray-300 bg-white px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-600"
            placeholder="イベントIDを入力"
            value={eventId}
            onChange={(e) => setEventId(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && search()}
          />
          <button
            className="rounded-xl border px-3 py-2 text-sm hover:bg-gray-50"
            onClick={() => void search()}
            disabled={loading}
          >
            検索
          </button>
        </div>

        {err && <div className="text-sm text-red-600">{err}</div>}

        {hit && (
          <div className="rounded-2xl border bg-white p-4 space-y-2">
            <div className="text-lg font-semibold">
              {hit.data.name ?? "イベント"}
            </div>
            <div className="text-sm text-gray-500">
              {hit.data.plannedAt?.toDate?.().toLocaleString?.() ??
                "日時未設定"}
            </div>
            {hit.data.note && (
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {hit.data.note}
              </p>
            )}

            <div className="pt-2">
              <button
                className="inline-flex items-center rounded-xl bg-blue-600 text-white px-4 py-2.5 font-medium hover:bg-blue-700 disabled:opacity-50"
                onClick={() => void join()}
                disabled={joining || alreadyMember}
              >
                {joining
                  ? "参加中..."
                  : alreadyMember
                    ? "参加済み"
                    : "参加する"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
