import { Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Student } from "../types";

interface LogbookFiltersProps {
  selectedStudent: Student | null;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
}

export function LogbookFilters({
  selectedStudent,
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
}: LogbookFiltersProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{selectedStudent ? "Filter Logbooks" : "Search Students"}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Search className="h-5 w-5 text-muted-foreground" />
              <Input
                placeholder={
                  selectedStudent
                    ? "Search logbooks..."
                    : "Search by student name or matric number..."
                }
                value={searchQuery}
                onChange={(event) => onSearchChange(event.target.value)}
              />
            </div>
          </div>

          {selectedStudent ? (
            <div className="w-full md:w-48">
              <Select value={statusFilter} onValueChange={onStatusFilterChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="pending">Pending Review</SelectItem>
                  <SelectItem value="reviewed">Reviewed</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
