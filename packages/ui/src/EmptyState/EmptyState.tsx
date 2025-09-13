import { type ReactNode } from "react";
import clsx from "clsx";

export type EmptyStateProps = {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

export const EmptyState = ({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) => {
  return (
    <div
      className={clsx(
        "flex",
        "flex-col",
        "items-center",
        "justify-center",
        "text-center",
        "p-8",
        "rounded-2xl",
        "border",
        "border-dashed",
        "border-gray-300",
        "bg-gray-50",
        className,
      )}
    >
      {icon && <div className="mb-4 text-gray-400">{icon}</div>}
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-gray-500 mb-4 max-w-sm">{description}</p>
      )}
      {action && (
        <div className="flex flex-col sm:flex-row gap-2">{action}</div>
      )}
    </div>
  );
};
