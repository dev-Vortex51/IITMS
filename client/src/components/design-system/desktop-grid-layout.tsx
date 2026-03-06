import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DesktopGridLayoutProps {
  children: ReactNode;
  className?: string;
  cols?: 2 | 3 | 4;
}

export function DesktopGridLayout({
  children,
  className,
  cols = 3,
}: DesktopGridLayoutProps) {
  const colClass = {
    2: "lg:grid-cols-2",
    3: "lg:grid-cols-3",
    4: "lg:grid-cols-4",
  }[cols];

  return <div className={cn("grid grid-cols-1 gap-4 md:gap-6", colClass, className)}>{children}</div>;
}
