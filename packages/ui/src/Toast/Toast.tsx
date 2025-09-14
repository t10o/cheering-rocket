import { type ReactNode,useEffect } from "react";
import clsx from "clsx";

export type ToastProps = {
  children: ReactNode;
  variant?: "success" | "error" | "info" | "warning";
  duration?: number;
  onClose?: () => void;
  className?: string;
};

export const Toast = ({
  children,
  variant = "info",
  duration = 3000,
  onClose,
  className,
}: ToastProps) => {
  useEffect(() => {
    if (duration > 0 && onClose) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const variantClasses = {
    success: ["bg-green-50", "border-green-200", "text-green-800"],
    error: ["bg-red-50", "border-red-200", "text-red-800"],
    info: ["bg-blue-50", "border-blue-200", "text-blue-800"],
    warning: ["bg-amber-50", "border-amber-200", "text-amber-800"],
  } as const;

  return (
    <div
      className={clsx(
        "fixed",
        "left-1/2",
        "top-4",
        "z-50",
        "-translate-x-1/2",
        "rounded-xl",
        "border",
        "px-4",
        "py-3",
        "shadow-lg",
        "max-w-sm",
        "w-full",
        "mx-4",
        variantClasses[variant],
        className,
      )}
      role="alert"
      aria-live="polite"
    >
      {children}
    </div>
  );
};
