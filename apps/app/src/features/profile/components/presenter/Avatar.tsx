import { forwardRef } from "react";
import clsx from "clsx";

export type AvatarProps = {
  photoURL?: string | null;
  name?: string;
  size?: number;
  className?: string;
};

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ photoURL, name, size = 40, className }, ref) => {
    const initials =
      name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "?";

    const sizeClasses = {
      sm: "text-xs",
      md: "text-sm",
      lg: "text-lg",
    } as const;

    const textSize = size <= 32 ? "sm" : size <= 48 ? "md" : "lg";

    return (
      <div
        ref={ref}
        className={clsx(
          "relative",
          "flex",
          "items-center",
          "justify-center",
          "rounded-full",
          "bg-marathon-100",
          "text-marathon-700",
          "font-medium",
          "overflow-hidden",
          "ring-2",
          "ring-white",
          "shadow-sm",
          sizeClasses[textSize],
          className,
        )}
        style={{ width: size, height: size }}
        role="img"
        aria-label={name ? `${name}のアバター` : "アバター"}
      >
        {photoURL ? (
          <img
            src={photoURL}
            alt={name ? `${name}のアバター` : "アバター"}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="select-none">{initials}</span>
        )}
      </div>
    );
  },
);

Avatar.displayName = "Avatar";
