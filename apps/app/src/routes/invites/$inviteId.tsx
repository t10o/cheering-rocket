import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  doc,
  getDoc,
  getFirestore,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { firebaseApp } from "@/libs/firebase";
import { useAuth } from "@/hooks/useAuth";
import { AppBar } from "@cheering/ui";

export const Route = createFileRoute("/invites/$inviteId")({
  component: InviteAcceptPage,
});

type Invite = {
  eventId: string;
  email: string;
  inviterUid: string;
  status: string;
};
type EventDoc = {
  name: string;
  note?: string;
  plannedAt?: any;
  ownerUid: string;
};

function InviteAcceptPage() {
  const nav = useNavigate();
  const { inviteId } = Route.useParams();
  const { user } = useAuth();
  const db = useMemo(() => getFirestore(firebaseApp), []);
  const [invite, setInvite] = useState<Invite | null>(null);
  const [ev, setEv] = useState<EventDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const inv = await getDoc(doc(db, "invites", inviteId));
      const invData = inv.data() as Invite | undefined;
      if (!invData) {
        setErr("招待が見つかりません");
        setLoading(false);
        return;
      }
      setInvite(invData);
      const evSnap = await getDoc(doc(db, "events", invData.eventId));
      setEv(evSnap.data() as EventDoc);
      setLoading(false);
    })();
  }, [db, inviteId]);

  async function accept() {
    if (!user || !invite) return;
    try {
      await setDoc(
        doc(db, "events", invite.eventId, "members", user.uid),
        {
          role: "member",
          joinedAt: serverTimestamp(),
          inviterUid: invite.inviterUid,
        },
        { merge: true },
      );
      await updateDoc(doc(db, "invites", inviteId), {
        status: "accepted",
        respondedAt: serverTimestamp(),
      });
      nav({ to: "/events/$eventId", params: { eventId: invite.eventId } });
    } catch (e: any) {
      setErr(e?.message ?? "処理に失敗しました");
    }
  }

  async function decline() {
    if (!invite) return;
    try {
      await updateDoc(doc(db, "invites", inviteId), {
        status: "declined",
        respondedAt: serverTimestamp(),
      });
      nav({ to: "/events" });
    } catch (e: any) {
      setErr(e?.message ?? "処理に失敗しました");
    }
  }

  if (loading) return <div className="p-4">Loading...</div>;
  if (err) return <div className="p-4 text-red-600">{err}</div>;
  if (!invite || !ev) return null;

  return (
    <div className="min-h-dvh bg-gray-50">
      <AppBar
        bordered
        center={<div>イベント招待</div>}
        left={
          <Link to="/" className="px-2 py-1 rounded-xl hover:bg-gray-100">
            戻る
          </Link>
        }
      />
      <div className="p-4 space-y-4">
        <div className="rounded-2xl border bg-white p-4 space-y-1">
          <Row k="イベント名" v={ev.name} />
          <Row
            k="ランの予定日"
            v={ev.plannedAt?.toDate?.().toLocaleString?.() ?? "未設定"}
          />
          <Row k="備考" v={ev.note || "—"} />
          <Row
            k="招待者"
            v={<code className="text-xs">{invite.inviterUid}</code>}
          />
        </div>
        <div className="flex gap-2 justify-end">
          <button
            className="rounded-xl border px-4 py-2 hover:bg-gray-50"
            onClick={() => void decline()}
          >
            辞退
          </button>
          <button
            className="rounded-xl bg-blue-600 text-white px-4 py-2 hover:bg-blue-700"
            onClick={() => void accept()}
          >
            参加する
          </button>
        </div>
      </div>
    </div>
  );
}
function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="text-sm">
      <span className="text-gray-500 mr-3">{k}</span>
      <span>{v}</span>
    </div>
  );
}
