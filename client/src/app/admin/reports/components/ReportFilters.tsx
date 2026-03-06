import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ReportFiltersProps {
  selectedFaculty: string;
  onFacultyChange: (value: string) => void;
  selectedDepartment: string;
  onDepartmentChange: (value: string) => void;
  faculties: Array<{ id: string; name: string }>;
  departments: Array<{ id: string; name: string }>;
}

export function ReportFilters({
  selectedFaculty,
  onFacultyChange,
  selectedDepartment,
  onDepartmentChange,
  faculties,
  departments,
}: ReportFiltersProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Filter Reports</CardTitle>
        <CardDescription>Select faculty and department to filter reports</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="report-faculty">Faculty</Label>
            <Select value={selectedFaculty} onValueChange={onFacultyChange}>
              <SelectTrigger id="report-faculty">
                <SelectValue placeholder="Select faculty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Faculties</SelectItem>
                {faculties.map((faculty) => (
                  <SelectItem key={faculty.id} value={faculty.id}>
                    {faculty.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="report-department">Department</Label>
            <Select value={selectedDepartment} onValueChange={onDepartmentChange}>
              <SelectTrigger id="report-department">
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((department) => (
                  <SelectItem key={department.id} value={department.id}>
                    {department.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
