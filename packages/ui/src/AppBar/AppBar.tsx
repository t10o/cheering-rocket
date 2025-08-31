import { forwardRef, type ReactNode } from "react";
import clsx from "clsx";

export type AppBarProps = {
  /** 左側に表示する要素（例: 戻るボタン等） */
  left?: ReactNode;
  /** 中央に表示する要素（例: タイトル） */
  center?: ReactNode;
  /** 右側に表示する要素（例: プロフィール等） */
  right?: ReactNode;

  /** 高さプリセット */
  size?: "sm" | "md" | "lg";
  /** 影を付ける（立体感） */
  elevated?: boolean;
  /** 下線（ボーダー）を付ける */
  bordered?: boolean;
  /** 位置固定: sticky or fixed（両方 false で通常フロー） */
  sticky?: boolean;
  fixed?: boolean;

  /** iOS の Safe Area を考慮（上マージン） */
  safeAreaTop?: boolean;

  className?: string;
};

export const AppBar = forwardRef<HTMLDivElement, AppBarProps>(function AppBar(
  {
    left,
    center,
    right,
    size = "md",
    elevated = false,
    bordered = false,
    sticky = false,
    fixed = false,
    className,
  },
  ref,
) {
  const wrapper = [
    "w-full",
    "bg-white",
    "text-gray-900",
    "relative",
    "z-40",
    // 位置
    sticky && "sticky top-0",
    fixed && "fixed top-0 left-0",
    // 見た目
    elevated && "shadow-soft",
    bordered && "border-b border-gray-200",
  ];

  const heights =
    size === "sm"
      ? ["h-12", "text-sm", "px-3"]
      : size === "lg"
        ? ["h-16", "text-base", "px-5"]
        : /* md */ ["h-14", "text-sm", "px-4"];

  return (
    <header ref={ref} className={clsx(wrapper, heights, className)}>
      <div className={clsx(["relative", "h-full", "w-full"])}>
        {/* 中央: 常に真ん中（左右幅に影響されない配置） */}
        <div
          className={clsx([
            "pointer-events-none",
            "absolute",
            "inset-0",
            "flex",
            "items-center",
            "justify-center",
          ])}
        >
          <div className="pointer-events-auto max-w-[80%] truncate">
            {center}
          </div>
        </div>

        {/* 左右: 通常フローで左右に配置 */}
        <div
          className={clsx([
            "flex",
            "items-center",
            "justify-between",
            "h-full",
          ])}
        >
          <div className={clsx(["flex", "items-center", "gap-2", "min-w-0"])}>
            {left}
          </div>
          <div className={clsx(["flex", "items-center", "gap-2", "min-w-0"])}>
            {right}
          </div>
        </div>
      </div>
    </header>
  );
});
