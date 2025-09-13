import {
  faPersonRunning,
  faUser,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import { createFileRoute } from "@tanstack/react-router";
import { MenuCard } from "@/shared/components/MenuCard";

export const Route = createFileRoute("/")({
  component: IndexPage,
});

function IndexPage() {
  const items = [
    {
      to: "/profile",
      label: "プロフィール",
      icon: faUser,
      description: "アカウント設定とプロフィール管理",
    },
    {
      to: "/events",
      label: "イベント管理",
      icon: faUsers,
      description: "マラソンイベントの作成と参加",
    },
    {
      to: "/runs",
      label: "ラン管理",
      icon: faPersonRunning,
      description: "ランニング記録と分析",
    },
  ];

  return (
    <div className="min-h-dvh bg-gradient-to-br from-marathon-50 to-finish-50">
      <div className="p-4 pb-[var(--safe-area-inset-bottom)]">
        <div className="text-center mb-8 pt-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Cheering Rocket
          </h1>
          <p className="text-gray-600">マラソンランナーを応援するアプリ</p>
        </div>

        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
          {items.map((item) => (
            <MenuCard
              key={item.to}
              to={item.to}
              label={item.label}
              icon={item.icon}
              description={item.description}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
