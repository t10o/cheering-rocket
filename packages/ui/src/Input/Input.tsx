import { forwardRef, type ReactNode } from "react";
import {
  type AriaTextFieldProps,
  useObjectRef,
  useTextField,
} from "react-aria";
import clsx from "clsx";

export type InputProps = AriaTextFieldProps & {
  variant?: "default" | "error" | "success";
  size?: "sm" | "md" | "lg";
  className?: string;
  label?: string;
  helperText?: string;
  errorMessage?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
};

export const Input = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  const {
    variant = "default",
    size = "md",
    className,
    label,
    helperText,
    errorMessage,
    leftIcon,
    rightIcon,
    ...textFieldProps
  } = props;

  const domRef = useObjectRef(ref);

  const textFieldOptions: AriaTextFieldProps = {
    ...textFieldProps,
    label,
  };

  if (!label && !textFieldOptions["aria-label"]) {
    textFieldOptions["aria-label"] =
      textFieldProps.placeholder || "入力フィールド";
  }

  const { labelProps, inputProps, descriptionProps, errorMessageProps } =
    useTextField(textFieldOptions, domRef);

  const cleanedInputProps = { ...inputProps };
  if (cleanedInputProps["aria-describedby"]) {
    const describedBy = new Set(
      cleanedInputProps["aria-describedby"].split(/\s+/).filter(Boolean),
    );
    if (!helperText && descriptionProps?.id) {
      describedBy.delete(descriptionProps.id);
    }
    if (!errorMessage && errorMessageProps?.id) {
      describedBy.delete(errorMessageProps.id);
    }
    cleanedInputProps["aria-describedby"] =
      describedBy.size > 0 ? Array.from(describedBy).join(" ") : undefined;
  }

  // input要素はchildrenを持たないので、childrenを除外
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { children, ...inputPropsWithoutChildren } = cleanedInputProps;

  const hasError = variant === "error" || !!errorMessage;

  const base = [
    "w-full",
    "rounded-xl",
    "border",
    "bg-white",
    "transition-colors",
    "duration-150",
    "focus:outline-none",
    "focus:ring-2",
    "focus:ring-offset-2",
    "disabled:opacity-50",
    "disabled:cursor-not-allowed",
  ];

  const sizeClasses = {
    sm: ["text-sm", "px-3", "py-2"],
    md: ["text-base", "px-4", "py-2.5"],
    lg: ["text-lg", "px-5", "py-3"],
  } as const;

  const variantClasses = {
    default: [
      "border-gray-300",
      "text-gray-900",
      "placeholder:text-gray-400",
      "focus:border-marathon-500",
      "focus:ring-marathon-500",
    ],
    error: [
      "border-red-300",
      "text-gray-900",
      "placeholder:text-gray-400",
      "focus:border-red-500",
      "focus:ring-red-500",
    ],
    success: [
      "border-green-300",
      "text-gray-900",
      "placeholder:text-gray-400",
      "focus:border-green-500",
      "focus:ring-green-500",
    ],
  } as const;

  const inputWrapper = [
    "relative",
    "flex",
    "items-center",
    leftIcon && "pl-10",
    rightIcon && "pr-10",
  ];

  return (
    <div className={clsx("space-y-1", className)}>
      {label && (
        <label
          {...labelProps}
          className={clsx(
            "block",
            "text-sm",
            "font-medium",
            hasError ? "text-red-700" : "text-gray-700",
            labelProps?.className,
          )}
        >
          {label}
        </label>
      )}
      <div className={clsx(inputWrapper)}>
        {leftIcon && (
          <div className="absolute left-3 text-gray-400 pointer-events-none">
            {leftIcon}
          </div>
        )}
        <input
          {...inputPropsWithoutChildren}
          onChange={(e) => {
            // react-ariaのonChangeと独自のonChangeの両方を呼び出す
            if (inputProps.onChange) {
              inputProps.onChange(e);
            }
            if (textFieldProps.onChange) {
              textFieldProps.onChange(e.target.value);
            }
          }}
          className={clsx(
            base,
            sizeClasses[size],
            variantClasses[hasError ? "error" : variant],
            className,
          )}
          ref={domRef}
        />
        {rightIcon && (
          <div className="absolute right-3 text-gray-400 pointer-events-none">
            {rightIcon}
          </div>
        )}
      </div>
      {helperText && !hasError && (
        <p
          {...descriptionProps}
          className={clsx("text-sm", "text-gray-500", descriptionProps?.className)}
        >
          {helperText}
        </p>
      )}
      {errorMessage && (
        <p
          {...errorMessageProps}
          className={clsx("text-sm", "text-red-600", errorMessageProps?.className)}
        >
          {errorMessage}
        </p>
      )}
    </div>
  );
});

Input.displayName = "Input";
