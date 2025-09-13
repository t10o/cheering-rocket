import { forwardRef, type ReactNode } from "react";
import clsx from "clsx";

export type TabItem = {
  to: string;
  label: string;
  icon: ReactNode;
  exact?: boolean;
  isActive?: boolean;
  onClick?: () => void;
};

export type TabBarProps = {
  items: TabItem[];
  className?: string;
};

export const TabBar = forwardRef<HTMLDivElement, TabBarProps>(
  ({ items, className }, ref) => {
    return (
      <div
        ref={ref}
        className={clsx(
          "fixed",
          "bottom-0",
          "left-0",
          "right-0",
          "bg-white",
          "border-t",
          "border-gray-200",
          "pb-[var(--safe-area-inset-bottom)]",
          "z-50",
          className,
        )}
      >
        <div className="flex">
          {items.map((item) => {
            return (
              <button
                key={item.to}
                onClick={item.onClick}
                className={clsx(
                  "flex-1",
                  "flex",
                  "flex-col",
                  "items-center",
                  "justify-center",
                  "py-2",
                  "px-1",
                  "text-xs",
                  "font-medium",
                  "transition-colors",
                  "duration-150",
                  "hover:bg-gray-50",
                  "focus:outline-none",
                  "focus:bg-gray-50",
                  item.isActive ? "text-marathon-600" : "text-gray-500",
                )}
                aria-current={item.isActive ? "page" : undefined}
              >
                <div
                  className={clsx(
                    "w-5",
                    "h-5",
                    "mb-1",
                    "flex",
                    "items-center",
                    "justify-center",
                    item.isActive ? "text-marathon-600" : "text-gray-400",
                  )}
                >
                  {item.icon}
                </div>
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  },
);

TabBar.displayName = "TabBar";
