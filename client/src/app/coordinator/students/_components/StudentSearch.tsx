import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface StudentSearchProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  placementFilter: string;
  setPlacementFilter: (val: string) => void;
}

export function StudentSearch({
  searchQuery,
  setSearchQuery,
  placementFilter,
  setPlacementFilter,
}: StudentSearchProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Filter Students</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, matric number, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-background"
            />
          </div>
          <Select value={placementFilter} onValueChange={setPlacementFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Placement status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All placement statuses</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="pending">Pending review</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="no-placement">No placement</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
