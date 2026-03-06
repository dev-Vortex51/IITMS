import type { InputHTMLAttributes } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type FilterFieldSearchProps = InputHTMLAttributes<HTMLInputElement>;

export function FilterFieldSearch({ className, ...props }: FilterFieldSearchProps) {
  return (
    <div className={cn("relative min-w-48", className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input className="pl-9" {...props} />
    </div>
  );
}
