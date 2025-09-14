import {
  faPersonRunning,
  faUser,
  faUsers,
  type IconDefinition,
} from "@fortawesome/free-solid-svg-icons";

export type MenuItem = {
  to: string;
  label: string;
  icon: IconDefinition;
  description: string;
};

export const getMenuItems = (): MenuItem[] => {
  return [
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
};
