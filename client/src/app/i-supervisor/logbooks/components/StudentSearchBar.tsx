import { Input } from "@/components/ui/input";

interface StudentSearchBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export function StudentSearchBar({
  searchQuery,
  onSearchChange,
}: StudentSearchBarProps) {
  return (
    <div className="flex gap-4">
      <div className="flex-1">
        <Input
          placeholder="Search students by name or matric number..."
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>
    </div>
  );
}
