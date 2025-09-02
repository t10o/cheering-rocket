import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { getAuth } from "firebase/auth";
import {
  addDoc,
  collection,
  doc,
  getFirestore,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { firebaseApp } from "@/libs/firebase";
import { useAuth } from "@/hooks/useAuth";
import clsx from "clsx";
import { AppBar } from "@cheering/ui";

export const Route = createFileRoute("/events/new/")({
  component: NewEventPage,
});

function NewEventPage() {
  const nav = useNavigate();
  const { user } = useAuth();
  const db = useMemo(() => getFirestore(firebaseApp), []);
  const auth = useMemo(() => getAuth(firebaseApp), []);
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handleCreate() {
    if (!user) return;
    if (!name.trim()) return setErr("イベント名を入力してください");
    if (!date) return setErr("予定日を入力してください");

    setSaving(true);
    setErr(null);
    try {
      const plannedAt = toTimestamp(date, time);
      // 1) イベント作成
      const evRef = await addDoc(collection(db, "events"), {
        name: name.trim(),
        plannedAt,
        note: note.trim(),
        ownerUid: user.uid,
        joinable: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // 2) 作成者をオーナーとしてメンバー登録
      await setDoc(doc(db, "events", evRef.id, "members", user.uid), {
        uid: user.uid, // ← 追加（CGクエリ用のフィールド）
        role: "owner",
        joinedAt: serverTimestamp(),
        inviterUid: user.uid,
      });

      // 3) 完了 → 詳細へ
      nav({ to: "/events/$eventId", params: { eventId: evRef.id } });
    } catch (e: any) {
      setErr(e?.message ?? "作成に失敗しました");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-dvh bg-gray-50">
      <AppBar
        bordered
        center={<div>イベント作成</div>}
        left={
          <Link to="/events" className="px-2 py-1 rounded-xl hover:bg-gray-100">
            戻る
          </Link>
        }
      />
      <div className="p-4 space-y-6">
        <Field label="イベント名">
          <input
            className={inputCls}
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={80}
          />
        </Field>
        <Field label="ランの予定日">
          <div className="flex gap-3">
            <input
              type="date"
              className={inputCls}
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <input
              type="time"
              className={inputCls}
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>
        </Field>
        <Field label="備考">
          <textarea
            className={clsx(inputCls, "h-28 resize-vertical")}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </Field>
        {err && <div className="text-sm text-red-600">{err}</div>}
        <div className="flex justify-end">
          <button
            className={primaryBtn}
            disabled={saving}
            onClick={() => void handleCreate()}
          >
            {saving ? "作成中..." : "作成する"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-2">
      <div className="text-sm text-gray-600">{label}</div>
      {children}
    </label>
  );
}
const inputCls =
  "w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-600";
const primaryBtn =
  "inline-flex items-center rounded-xl bg-blue-600 text-white px-4 py-2.5 font-medium hover:bg-blue-700";

function toTimestamp(date: string, time?: string) {
  // ローカル時刻のまま Timestamp に（必要ならTZ考慮ロジックを後で）
  const t = time && time.length ? `${date}T${time}` : `${date}T00:00`;
  return new Date(t);
}
