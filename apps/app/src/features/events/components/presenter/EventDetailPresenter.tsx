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
  isHeicImage: (url: string) => boolean;
};

export const EventDetailPresenter = ({
  event,
  members,
  eventId,
  cheerUrl,
  isOwner,
  onCopyEventId,
  onCopyCheerUrl,
  isHeicImage,
}: EventDetailPresenterProps) => {
  return (
    <div className="min-h-dvh bg-gradient-to-br from-gray-50 to-gray-100">
      <PageHeader title={event.name ?? "イベント"} left={<BackButton />} />
      <div className="p-4 space-y-6">
        {/* 概要セクション */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">概要</h2>
          </div>
          <div className="p-6 space-y-4">
            <InfoRow icon="🏃‍♂️" label="イベント名" value={event.name} />
            <InfoRow
              icon="📅"
              label="ランの予定日"
              value={event.plannedAt?.toDate?.().toLocaleString?.() ?? "未設定"}
            />
            <InfoRow icon="📝" label="備考" value={event.note || "—"} />
          </div>
        </div>

        {/* イベントIDセクション */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">イベントID</h2>
          </div>
          <div className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
                <code className="text-sm font-mono text-gray-800 break-all">
                  {eventId}
                </code>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={onCopyEventId}
                className="shrink-0"
              >
                コピー
              </Button>
            </div>
            <p className="text-sm text-gray-600 mt-3">
              参加したいユーザーは「イベントIDで参加」からこのIDを入力してください。
            </p>
          </div>
        </div>

        {/* 応援用URLセクション */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">応援用URL</h2>
          </div>
          <div className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
                <code className="text-sm font-mono text-gray-800 break-all">
                  {cheerUrl}
                </code>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={onCopyCheerUrl}
                className="shrink-0"
              >
                コピー
              </Button>
            </div>
            <p className="text-sm text-gray-600 mt-3">
              参加ユーザーはこのURLを表示できます。
            </p>
          </div>
        </div>

        {/* メンバーセクション */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">メンバー</h2>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {members.map((m) => (
                <div
                  key={m.uid}
                  className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-200"
                >
                  <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                    {m.photoUrl && !isHeicImage(m.photoUrl) ? (
                      <img
                        src={m.photoUrl}
                        alt={m.name || "ユーザー"}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // 画像読み込みエラー時はフォールバック表示
                          e.currentTarget.style.display = "none";
                          const fallback = e.currentTarget
                            .nextElementSibling as HTMLElement;
                          if (fallback) fallback.style.display = "flex";
                        }}
                      />
                    ) : null}
                    <div
                      className={`w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm ${
                        m.photoUrl && !isHeicImage(m.photoUrl)
                          ? "hidden"
                          : "flex"
                      }`}
                    >
                      {(m.name || "未").charAt(0)}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">
                      {m.name || "（名前未設定）"}
                    </div>
                  </div>
                  {m.role === "owner" && (
                    <span className="px-3 py-1 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-medium">
                      管理者
                    </span>
                  )}
                  {m.role === "admin" && (
                    <span className="px-3 py-1 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs font-medium">
                      共同管理
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="text-2xl">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-500 mb-1">{label}</div>
        <div className="text-base text-gray-900 break-words">{value}</div>
      </div>
    </div>
  );
}
