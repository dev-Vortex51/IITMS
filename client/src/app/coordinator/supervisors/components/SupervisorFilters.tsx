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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SupervisorFiltersProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  academicCount: number;
  industrialCount: number;
}

export function SupervisorFilters({
  activeTab,
  onTabChange,
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  academicCount,
  industrialCount,
}: SupervisorFiltersProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Filter Supervisors</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={activeTab} onValueChange={onTabChange}>
          <TabsList className="grid w-full grid-cols-2 sm:w-auto">
            <TabsTrigger value="academic">Academic ({academicCount})</TabsTrigger>
            <TabsTrigger value="industrial">
              Industrial ({industrialCount})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, department, or company..."
              value={searchQuery}
              onChange={(event) => onSearchChange(event.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
            <SelectTrigger>
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
