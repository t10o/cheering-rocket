import { forwardRef } from "react";
import clsx from "clsx";

export type SkeletonProps = {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: boolean | "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  animate?: boolean;
};

export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, width, height, rounded = true, animate = true }, ref) => {
    return (
      <div
        ref={ref}
        className={clsx(
          "bg-gray-200",
          {
            "animate-pulse": animate,
            rounded: rounded === true,
            "rounded-sm": rounded === "sm",
            "rounded-md": rounded === "md",
            "rounded-lg": rounded === "lg",
            "rounded-xl": rounded === "xl",
            "rounded-2xl": rounded === "2xl",
            "rounded-full": rounded === "full",
          },
          className,
        )}
        style={{
          width: width
            ? typeof width === "number"
              ? `${width}px`
              : width
            : undefined,
          height: height
            ? typeof height === "number"
              ? `${height}px`
              : height
            : undefined,
        }}
      />
    );
  },
);

Skeleton.displayName = "Skeleton";
