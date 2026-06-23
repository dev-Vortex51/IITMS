import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface FilterOption {
  label: string;
  value: string;
}

interface FilterFieldSelectProps {
  value?: string;
  onChange: (value: string) => void;
  options: FilterOption[];
  placeholder?: string;
  className?: string;
}

const ALL_SENTINEL = "__all__";

export function FilterFieldSelect({
  value,
  onChange,
  options,
  placeholder = "Select...",
  className,
}: FilterFieldSelectProps) {
  const internalValue = value || ALL_SENTINEL;
  const handleChange = (v: string) => {
    onChange(v === ALL_SENTINEL ? "" : v);
  };
  return (
    <Select value={internalValue} onValueChange={handleChange}>
      <SelectTrigger className={cn("min-w-40", className)}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value || ALL_SENTINEL} value={option.value || ALL_SENTINEL}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
