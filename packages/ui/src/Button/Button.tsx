import { IconDefinition } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import clsx from "clsx";
import { ButtonHTMLAttributes, forwardRef } from "react";
import { Spacer } from "../Spacer";

type ButtonColor = "primary" | "text" | "danger" | "warning" | "info";
type ButtonVariant = "contained" | "outlined" | "text";

interface BaseProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
  icon?: IconDefinition;
}

type Props =
  | (BaseProps & { color: "text"; variant: "text" })
  | (BaseProps & {
      color?: Exclude<ButtonColor, "text">;
      variant?: ButtonVariant;
    });

export const Button = forwardRef<HTMLButtonElement, Props>(
  (
    {
      className,
      label,
      icon,
      variant = "contained",
      color = "primary",
      ...props
    }: Props,
    ref,
  ) => {
    const backgroundColor = {
      contained: {
        primary: "bg-primary",
        danger: "bg-danger",
        warning: "bg-warning",
        info: "bg-info",
        text: "bg-black",
      },
      outlined: {
        primary: "bg-white",
        danger: "bg-white",
        warning: "bg-white",
        info: "bg-white",
        text: "bg-white",
      },
      text: {
        primary: "bg-white",
        danger: "bg-white",
        warning: "bg-white",
        info: "bg-white",
        text: "bg-white",
      },
    };

    const textColor = {
      contained: {
        primary: "text-white",
        danger: "text-white",
        warning: "text-white",
        info: "text-white",
        text: "text-white",
      },
      outlined: {
        primary: "text-primary",
        danger: "text-danger",
        warning: "text-warning",
        info: "text-info",
        text: "text-black",
      },
      text: {
        primary: "text-primary",
        danger: "text-danger",
        warning: "text-warning",
        info: "text-info",
        text: "text-black",
      },
    };

    const borderColor = {
      contained: {
        primary: "border-primary",
        danger: "border-danger",
        warning: "border-warning",
        info: "border-info",
        text: "border-black",
      },
      outlined: {
        primary: "border-primary",
        danger: "border-danger",
        warning: "border-warning",
        info: "border-info",
        text: "border-black",
      },
      text: {
        primary: "border-none",
        danger: "border-none",
        warning: "border-none",
        info: "border-none",
        text: "border-none",
      },
    };

    return (
      <button
        ref={ref}
        className={clsx(
          className,
          "cursor-pointer",
          "rounded",
          "px-4",
          "h-12",
          backgroundColor[variant][color],
          textColor[variant][color],
          borderColor[variant][color],
          variant === "outlined" ? "border-2" : "",
          color !== "text" && variant !== "text" && "font-bold",
          props.disabled && ["opacity-50", "cursor-not-allowed"],
        )}
        {...props}
      >
        {icon && (
          <>
            <FontAwesomeIcon icon={icon} />
            <Spacer size="xsmall" />
          </>
        )}
        {label}
      </button>
    );
  },
);

Button.displayName = "Button";
