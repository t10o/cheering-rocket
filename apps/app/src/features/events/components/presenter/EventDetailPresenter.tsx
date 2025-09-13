import { PageHeader } from "@/shared/components/PageHeader";
import { BackButton } from "@/shared/components/BackButton";
import { Button } from "@cheering/ui";
import { type Event, type MemberView } from "../../functions/eventDetail";

export type EventDetailPresenterProps = {
  event: Event;
  members: MemberView[];
  eventId: string;
  cheerUrl: string;
  isOwner: boolean;
  onCopyEventId: () => void;
  onCopyCheerUrl: () => void;
};

export const EventDetailPresenter = ({
  event,
  members,
  eventId,
  cheerUrl,
  isOwner,
  onCopyEventId,
  onCopyCheerUrl,
}: EventDetailPresenterProps) => {
  return (
    <div className="min-h-dvh bg-gray-50">
      <PageHeader title={event.name ?? "イベント"} left={<BackButton />} />
      <div className="p-4 space-y-6">
        <Section title="概要">
          <Row label="イベント名" value={event.name} />
          <Row
            label="ランの予定日"
            value={event.plannedAt?.toDate?.().toLocaleString?.() ?? "未設定"}
          />
          <Row label="備考" value={event.note || "—"} />
        </Section>

        <Section title="イベントID">
          <div className="flex items-center gap-2">
            <code className="rounded-lg bg-white border px-3 py-2 text-sm break-all">
              {eventId}
            </code>
            <Button variant="secondary" size="sm" onClick={onCopyEventId}>
              コピー
            </Button>
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
            <Button variant="secondary" size="sm" onClick={onCopyCheerUrl}>
              コピー
            </Button>
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
};

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
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
