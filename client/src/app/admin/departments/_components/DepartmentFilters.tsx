import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";

export default function DepartmentFilters({ state, setters, faculties }: any) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search departments by name or code..."
              value={state.searchTerm}
              onChange={(e) => {
                setters.setSearchTerm(e.target.value);
                setters.setCurrentPage(1);
              }}
              className="pl-10"
            />
          </div>
          <div className="w-full sm:w-64">
            <Select
              value={state.selectedFaculty}
              onValueChange={(val) => {
                setters.setSelectedFaculty(val);
                setters.setCurrentPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by faculty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Faculties</SelectItem>
                {faculties.map((faculty: any) => (
                  <SelectItem key={faculty.id} value={faculty.id}>
                    {faculty.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="showInactive"
              checked={state.showInactive}
              onChange={(e) => {
                setters.setShowInactive(e.target.checked);
                setters.setCurrentPage(1);
              }}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="showInactive" className="text-sm cursor-pointer">
              Show inactive
            </Label>
          </div>
          {(state.searchTerm ||
            (state.selectedFaculty && state.selectedFaculty !== "all")) && (
            <Button
              variant="outline"
              onClick={() => {
                setters.setSearchTerm("");
                setters.setSelectedFaculty("all");
                setters.setCurrentPage(1);
              }}
              className="w-full sm:w-auto"
            >
              Clear Filters
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
