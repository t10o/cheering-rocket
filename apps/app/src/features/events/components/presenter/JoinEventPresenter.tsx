import { Button, Input } from "@cheering/ui";

import { type EventLite } from "../../functions/joinEvent";

import { JoinEventSkeleton } from "./JoinEventSkeleton";

import { BackButton } from "@/shared/components/BackButton";
import { PageHeader } from "@/shared/components/PageHeader";

export type JoinEventPresenterProps = {
  eventId: string;
  onEventIdChange: (value: string) => void;
  onSearch: () => void;
  onJoin: () => void;
  hit: { id: string; data: EventLite } | null;
  loading: boolean;
  joining: boolean;
  error: string | null;
  alreadyMember: boolean;
};

export const JoinEventPresenter = ({
  eventId,
  onEventIdChange,
  onSearch,
  onJoin,
  hit,
  loading,
  joining,
  error,
  alreadyMember,
}: JoinEventPresenterProps) => {
  return (
    <div className="min-h-dvh bg-gray-50">
      <PageHeader title="イベントIDで参加" left={<BackButton />} />
      <div className="p-4 space-y-4">
        {loading ? (
          <JoinEventSkeleton />
        ) : (
          <div className="flex gap-2">
            <Input
              className="flex-1"
              placeholder="イベントIDを入力"
              value={eventId}
              onChange={onEventIdChange}
              onKeyDown={(e) => e.key === "Enter" && onSearch()}
            />
            <Button variant="secondary" onClick={onSearch} isDisabled={loading}>
              検索
            </Button>
          </div>
        )}

        {error && <div className="text-sm text-red-600">{error}</div>}

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
              <Button onClick={onJoin} isDisabled={joining || alreadyMember}>
                {joining
                  ? "参加中..."
                  : alreadyMember
                    ? "参加済み"
                    : "参加する"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
