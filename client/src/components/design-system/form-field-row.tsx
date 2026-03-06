import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface FormFieldRowProps {
  children: ReactNode;
  className?: string;
  cols?: 1 | 2 | 3;
}

export function FormFieldRow({
  children,
  className,
  cols = 2,
}: FormFieldRowProps) {
  const colClass = {
    1: "md:grid-cols-1",
    2: "md:grid-cols-2",
    3: "md:grid-cols-3",
  }[cols];

  return <div className={cn("grid grid-cols-1 gap-4", colClass, className)}>{children}</div>;
}
