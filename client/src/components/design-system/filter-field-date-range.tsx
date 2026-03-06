import { Input } from "@/components/ui/input";

interface FilterFieldDateRangeProps {
  from?: string;
  to?: string;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
}

export function FilterFieldDateRange({
  from,
  to,
  onFromChange,
  onToChange,
}: FilterFieldDateRangeProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Input
        type="date"
        value={from || ""}
        onChange={(event) => onFromChange(event.target.value)}
        className="min-w-36"
      />
      <span className="text-sm text-muted-foreground">to</span>
      <Input
        type="date"
        value={to || ""}
        onChange={(event) => onToChange(event.target.value)}
        className="min-w-36"
      />
    </div>
  );
}
