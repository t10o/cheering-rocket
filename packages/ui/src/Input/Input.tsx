import { forwardRef, type ReactNode } from "react";
import {
  type AriaTextFieldProps,
  mergeProps,
  useTextField,
  useObjectRef,
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

  // アクセシビリティのためのaria-labelを設定
  // 既存のaria-labelがある場合はそれを使用、なければlabelまたはplaceholderを使用
  const ariaLabel =
    textFieldProps["aria-label"] ||
    label ||
    textFieldProps.placeholder ||
    "入力フィールド";

  const textFieldOptions = {
    ...textFieldProps,
    "aria-label": ariaLabel,
  };

  const { labelProps, inputProps, descriptionProps, errorMessageProps } =
    useTextField(textFieldOptions, domRef);

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
          htmlFor={"htmlFor" in labelProps ? labelProps.htmlFor : undefined}
          id={"id" in labelProps ? labelProps.id : undefined}
          className={clsx(
            "block",
            "text-sm",
            "font-medium",
            hasError ? "text-red-700" : "text-gray-700",
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
          {...(inputProps as any)}
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
          id={"id" in descriptionProps ? descriptionProps.id : undefined}
          className="text-sm text-gray-500"
        >
          {helperText}
        </p>
      )}
      {errorMessage && (
        <p
          id={"id" in errorMessageProps ? errorMessageProps.id : undefined}
          className="text-sm text-red-600"
        >
          {errorMessage}
        </p>
      )}
    </div>
  );
});

Input.displayName = "Input";
