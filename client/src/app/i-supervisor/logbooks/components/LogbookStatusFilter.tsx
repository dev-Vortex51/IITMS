import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface LogbookStatusFilterProps {
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
}

export function LogbookStatusFilter({
  statusFilter,
  onStatusFilterChange,
}: LogbookStatusFilterProps) {
  return (
    <div className="flex gap-4">
      <Select value={statusFilter} onValueChange={onStatusFilterChange}>
        <SelectTrigger className="w-[200px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Logbooks</SelectItem>
          <SelectItem value="pending">Pending Review</SelectItem>
          <SelectItem value="reviewed">Reviewed</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
