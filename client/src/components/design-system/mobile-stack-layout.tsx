import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MobileStackLayoutProps {
  children: ReactNode;
  className?: string;
}

export function MobileStackLayout({ children, className }: MobileStackLayoutProps) {
  return <div className={cn("flex flex-col gap-4 md:gap-6", className)}>{children}</div>;
}
