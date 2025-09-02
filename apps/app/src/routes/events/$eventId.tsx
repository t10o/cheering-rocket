import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  query,
  where,
  documentId,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { firebaseApp } from "@/libs/firebase";
import { useAuth } from "@/hooks/useAuth";
import { AppBar } from "@cheering/ui";
import clsx from "clsx";

export const Route = createFileRoute("/events/$eventId")({
  component: EventDetail,
});

type Ev = {
  name: string;
  plannedAt?: any;
  note?: string;
  ownerUid: string;
  joinable?: boolean;
};
type MemberView = { uid: string; role: string; name?: string };

function EventDetail() {
  const { eventId } = Route.useParams();
  const { user } = useAuth();
  const db = useMemo(() => getFirestore(firebaseApp), []);
  const [ev, setEv] = useState<Ev | null>(null);
  const [members, setMembers] = useState<MemberView[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        // イベント本体
        const s = await getDoc(doc(db, "events", eventId));
        const evData = s.data() as Ev | undefined;
        if (!evData) throw new Error("イベントが存在しません");
        setEv(evData);

        // メンバー一覧
        const mg = await getDocs(collection(db, "events", eventId, "members"));
        const base = mg.docs.map((d) => ({
          uid: d.id,
          role: (d.data() as any)?.role ?? "member",
        }));

        // users から名前をまとめ取得（最大10件ずつ）
        const uids = base.map((m) => m.uid);
        const nameMap = new Map<string, string | undefined>();
        for (let i = 0; i < uids.length; i += 10) {
          const chunk = uids.slice(i, i + 10);
          const qs = query(
            collection(db, "users"),
            where(documentId(), "in", chunk),
          );
          const us = await getDocs(qs);
          us.docs.forEach((u) =>
            nameMap.set(u.id, (u.data() as any)?.name ?? ""),
          );
        }

        const withNames = base.map((m) => ({
          ...m,
          name: nameMap.get(m.uid) || "",
        }));
        const order = { owner: 0, admin: 1, member: 2 } as Record<
          string,
          number
        >;
        withNames.sort((a, b) => {
          const oa = order[a.role] ?? 99;
          const ob = order[b.role] ?? 99;
          if (oa !== ob) return oa - ob;
          return (a.name || a.uid).localeCompare(b.name || b.uid);
        });
        setMembers(withNames);
      } finally {
        setLoading(false);
      }
    })();
  }, [db, eventId]);

  const cheerUrl = `${window.location.origin}/cheer/${eventId}`;
  const isOwner = !!(user && ev && ev.ownerUid === user.uid);

  if (!ev || loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="min-h-dvh bg-gray-50">
      <AppBar
        bordered
        center={<div>{ev.name ?? "イベント"}</div>}
        left={
          <Link to="/events" className="px-2 py-1 rounded-xl hover:bg-gray-100">
            戻る
          </Link>
        }
      />
      <div className="p-4 space-y-6">
        <Section title="概要">
          <Row label="イベント名" value={ev.name} />
          <Row
            label="ランの予定日"
            value={ev.plannedAt?.toDate?.().toLocaleString?.() ?? "未設定"}
          />
          <Row label="備考" value={ev.note || "—"} />
        </Section>

        {/* ★ イベントID（共有用） */}
        <Section title="イベントID">
          <div className="flex items-center gap-2">
            <code className="rounded-lg bg-white border px-3 py-2 text-sm break-all">
              {eventId}
            </code>
            <button
              className={ghostBtn}
              onClick={() => navigator.clipboard.writeText(eventId)}
            >
              コピー
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            参加したいユーザーは「イベントIDで参加」からこのIDを入力してください。
          </p>
        </Section>

        <Section title="応援用URL">
          <div className="flex items-center gap-2">
            <code className="rounded-lg bg-white border px-3 py-2 text-sm break-all">
              {cheerUrl}
            </code>
            <button
              className={ghostBtn}
              onClick={() => navigator.clipboard.writeText(cheerUrl)}
            >
              コピー
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            参加ユーザーはこのURLを表示できます。
          </p>
        </Section>

        <Section title="メンバー">
          <ul className="space-y-1">
            {members.map((m) => (
              <li key={m.uid} className="text-sm flex items-center gap-2">
                <span className="font-medium">
                  {m.name || "（名前未設定）"}
                </span>
                <span className="text-xs text-gray-500 font-mono">{m.uid}</span>
                {m.role === "owner" && (
                  <span className="ml-1 rounded bg-gray-200 px-1.5 py-0.5 text-[11px]">
                    管理者
                  </span>
                )}
                {m.role === "admin" && (
                  <span className="ml-1 rounded bg-gray-200 px-1.5 py-0.5 text-[11px]">
                    共同管理
                  </span>
                )}
              </li>
            ))}
          </ul>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: any) {
  return (
    <section className="space-y-2">
      <h2 className="text-sm text-gray-600">{title}</h2>
      <div className="rounded-2xl border bg-white p-4">{children}</div>
    </section>
  );
}
function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex gap-3 py-1 text-sm">
      <div className="w-28 text-gray-500">{label}</div>
      <div className="flex-1 break-words">{value}</div>
    </div>
  );
}
const ghostBtn =
  "inline-flex items-center rounded-xl border px-3 py-2 text-sm hover:bg-gray-50";
