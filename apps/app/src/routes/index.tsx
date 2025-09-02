import {
  faPersonRunning,
  faUser,
  faUsers,
  type IconDefinition,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { createFileRoute, Link } from "@tanstack/react-router";
import clsx from "clsx";

export const Route = createFileRoute("/")({
  component: IndexPage,
});

function IndexPage() {
  const grid = [
    "grid",
    "grid-cols-2",
    "gap-4",
    "p-4",
    "pb-[var(--safe-area-inset-bottom)]",
  ];

  const items: Array<{
    to: string;
    label: string;
    icon: IconDefinition;
  }> = [
    { to: "/profile", label: "プロフィール", icon: faUser },
    { to: "/events", label: "グループ管理", icon: faUsers },
    { to: "/runs", label: "ラン管理", icon: faPersonRunning },
  ];

  return (
    <div className="min-h-dvh bg-gray-50">
      <div className={clsx(grid)}>
        {items.map((item) => (
          <MenuCard
            key={item.to}
            to={item.to}
            label={item.label}
            icon={item.icon}
          />
        ))}
      </div>
    </div>
  );
}

function MenuCard({
  to,
  label,
  icon,
}: {
  to: string;
  label: string;
  icon: IconDefinition;
}) {
  const card = [
    "group",
    "block",
    "aspect-square",
    "rounded-2xl",
    "border",
    "border-gray-200",
    "bg-white",
    "shadow-sm",
    "hover:shadow-md",
    "transition",
    "duration-150",
    "touch-manipulation",
    "focus-visible:outline-none",
    "focus-visible:ring-2",
    "focus-visible:ring-blue-500",
  ];
  const inner = [
    "h-full",
    "w-full",
    "flex",
    "flex-col",
    "items-center",
    "justify-center",
    "gap-3",
    "p-4",
    "text-gray-900",
  ];
  const iconCls = [
    "h-8",
    "w-8",
    "opacity-90",
    "group-hover:scale-105",
    "transition-transform",
  ];
  const labelCls = ["text-sm", "font-medium"];

  return (
    <Link to={to} className={clsx(card)} title={label} aria-label={label}>
      <div className={clsx(inner)}>
        <FontAwesomeIcon icon={icon} className={clsx(iconCls)} />
        <div className={clsx(labelCls)}>{label}</div>
      </div>
    </Link>
  );
}
