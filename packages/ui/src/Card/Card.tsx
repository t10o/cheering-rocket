import { forwardRef, type ReactNode } from "react";
import clsx from "clsx";

export type CardProps = {
  children?: ReactNode;
  className?: string;
  variant?: "default" | "elevated" | "outlined";
  padding?: "none" | "sm" | "md" | "lg";
  interactive?: boolean;
  onClick?: () => void;
  role?: string;
  "aria-label"?: string;
  "aria-describedby"?: string;
};

export const Card = forwardRef<HTMLDivElement, CardProps>((props, ref) => {
  const {
    children,
    className,
    variant = "default",
    padding = "md",
    interactive = false,
    onClick,
    role,
    "aria-label": ariaLabel,
    "aria-describedby": ariaDescribedBy,
  } = props;

  const base = ["rounded-2xl", "bg-white", "transition-all", "duration-150"];

  const variantClasses = {
    default: ["shadow-sm"],
    elevated: ["shadow-lg", "hover:shadow-xl"],
    outlined: ["border", "border-gray-200"],
  } as const;

  const paddingClasses = {
    none: [],
    sm: ["p-3"],
    md: ["p-4"],
    lg: ["p-6"],
  } as const;

  const interactiveClasses = interactive
    ? [
        "cursor-pointer",
        "hover:shadow-md",
        "active:scale-[0.98]",
        "focus-visible:outline-none",
        "focus-visible:ring-2",
        "focus-visible:ring-amber-500",
        "focus-visible:ring-offset-2",
      ]
    : [];

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (onClick && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      onClick();
    }
  };

  return (
    <div
      ref={ref}
      className={clsx(
        base,
        variantClasses[variant],
        paddingClasses[padding],
        interactiveClasses,
        className,
      )}
      onClick={onClick}
      onKeyDown={onClick ? handleKeyDown : undefined}
      role={role}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      tabIndex={interactive ? 0 : undefined}
    >
      {children}
    </div>
  );
});

Card.displayName = "Card";
