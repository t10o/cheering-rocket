import { forwardRef, type ReactNode } from "react";
import {
  type AriaButtonProps,
  mergeProps,
  useButton,
  useObjectRef,
} from "react-aria";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import clsx from "clsx";

export type GoogleButtonProps = AriaButtonProps<"button"> & {
  size?: "sm" | "md" | "lg";
  className?: string;
  children?: ReactNode;
};

export const GoogleButton = forwardRef<HTMLButtonElement, GoogleButtonProps>(
  (props, ref) => {
    const { size = "md", className } = props;

    const domRef = useObjectRef(ref);
    const { buttonProps, isPressed } = useButton(props, domRef);

    const base = [
      "inline-flex",
      "items-center",
      "justify-center",
      "gap-3",
      "rounded-2xl",
      "font-medium",
      "transition-colors",
      "duration-150",
      "focus-visible:outline-none",
      "focus-visible:ring-2",
      "ring-offset-2",
      "disabled:opacity-50",
      "disabled:cursor-not-allowed",
      "bg-white",
      "text-gray-900",
      "border",
      "border-gray-200",
      "hover:bg-gray-50",
    ];

    const sizeClasses = {
      sm: ["text-sm", "px-3", "py-1.5"],
      md: ["text-sm", "px-4", "py-2"],
      lg: ["text-base", "px-5", "py-3"],
    } as const;

    const focusRing = ["focus-visible:ring-[#1a73e8]"];
    const pressed = isPressed && "translate-y-[0.5px]";

    return (
      <button
        {...mergeProps({ type: "button" as const }, buttonProps, {
          className: clsx(
            base,
            sizeClasses[size],
            focusRing,
            pressed,
            className,
          ),
        })}
        ref={domRef}
      >
        <span className={clsx(["-ml-0.5", "flex"])}>
          {/* @ts-expect-error - FontAwesome React 19 compatibility issue */}
          <FontAwesomeIcon icon={faGoogle} />
        </span>
        <span>{props.children ?? "Google で続ける"}</span>
      </button>
    );
  },
);

GoogleButton.displayName = "GoogleButton";
