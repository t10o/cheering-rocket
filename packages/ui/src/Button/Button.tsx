import { forwardRef, type ReactNode } from "react";
import {
  type AriaButtonProps,
  mergeProps,
  useButton,
  useObjectRef,
} from "react-aria";
import clsx from "clsx";

export type ButtonProps = AriaButtonProps<"button"> & {
  variant?: "primary" | "secondary" | "ghost" | "destructive" | "outline";
  size?: "sm" | "md" | "lg";
  className?: string;
  children?: ReactNode;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => {
    const { variant = "primary", size = "md", className } = props;

    const domRef = useObjectRef(ref);
    const { buttonProps, isPressed } = useButton(props, domRef);

    const base = [
      "inline-flex",
      "items-center",
      "justify-center",
      "gap-2",
      "rounded-2xl",
      "font-medium",
      "transition-colors",
      "duration-150",
      "focus-visible:outline-none",
      "focus-visible:ring-2",
      "ring-offset-2",
      "disabled:opacity-50",
      "disabled:cursor-not-allowed",
    ];

    const sizeClasses = {
      sm: ["text-sm", "px-3", "py-1.5"],
      md: ["text-sm", "px-4", "py-2"],
      lg: ["text-base", "px-5", "py-3"],
    } as const;

    const variantClasses = {
      primary: [
        "bg-marathon-600",
        "text-white",
        "hover:bg-marathon-700",
        "active:bg-marathon-700",
        "shadow-marathon",
      ],
      secondary: [
        "bg-white",
        "text-marathon-700",
        "border",
        "border-marathon-200",
        "hover:bg-marathon-50",
        "hover:border-marathon-300",
      ],
      ghost: ["text-marathon-600", "hover:bg-marathon-50"],
      destructive: [
        "bg-red-600",
        "text-white",
        "hover:bg-red-700",
        "active:bg-red-700",
        "shadow-red",
      ],
      outline: [
        "bg-white",
        "text-gray-700",
        "border",
        "border-gray-200",
        "hover:bg-gray-50",
        "hover:border-gray-300",
      ],
    } as const;

    const focusRing = ["focus-visible:ring-marathon-500"];

    return (
      <button
        {...mergeProps({ type: "button" as const }, buttonProps, {
          className: clsx(
            base,
            sizeClasses[size],
            variantClasses[variant],
            focusRing,
            isPressed && "translate-y-[0.5px]",
            className,
          ),
        })}
        ref={domRef}
      >
        {props.children}
      </button>
    );
  },
);

Button.displayName = "Button";
