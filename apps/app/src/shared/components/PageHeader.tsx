import { type ReactNode } from "react";

import { AppBar } from "@cheering/ui";

export type PageHeaderProps = {
  title: ReactNode;
  left?: ReactNode;
  right?: ReactNode;
  className?: string;
};

export const PageHeader = ({
  title,
  left,
  right,
  className,
}: PageHeaderProps) => {
  return (
    <AppBar
      bordered
      left={left}
      center={<div className="font-semibold">{title}</div>}
      right={right}
      className={className || ""}
    />
  );
};
