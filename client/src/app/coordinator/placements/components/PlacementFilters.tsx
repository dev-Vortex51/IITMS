import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function PlacementFilters({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
}: any) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 items-center bg-card/50 p-1.5 rounded-xl border border-border/50 shadow-sm">
      <div className="relative flex-1 w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by student name, company, or matric number..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none"
        />
      </div>
      <div className="w-full sm:w-auto sm:border-l border-border/50 sm:pl-1">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px] border-0 bg-transparent shadow-none focus:ring-0">
            <SelectValue placeholder="Filter Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="withdrawn">Withdrawn</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
