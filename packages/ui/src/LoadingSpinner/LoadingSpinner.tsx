import { forwardRef } from "react";
import clsx from "clsx";

export type LoadingSpinnerProps = {
  size?: "sm" | "md" | "lg";
  className?: string;
  "aria-label"?: string;
};

export const LoadingSpinner = forwardRef<HTMLDivElement, LoadingSpinnerProps>(
  (props, ref) => {
    const {
      size = "md",
      className,
      "aria-label": ariaLabel = "読み込み中",
    } = props;

    const base = [
      "inline-block",
      "animate-spin",
      "rounded-full",
      "border-solid",
      "border-current",
      "border-r-transparent",
    ];

    const sizeClasses = {
      sm: ["h-4", "w-4", "border-2"],
      md: ["h-6", "w-6", "border-2"],
      lg: ["h-8", "w-8", "border-4"],
    } as const;

    return (
      <div
        ref={ref}
        className={clsx(
          base,
          sizeClasses[size],
          "text-marathon-600",
          className,
        )}
        role="status"
        aria-label={ariaLabel}
      >
        <span className="sr-only">{ariaLabel}</span>
      </div>
    );
  },
);

LoadingSpinner.displayName = "LoadingSpinner";
