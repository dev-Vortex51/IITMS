import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserCheck, Save } from "lucide-react";

export function SupervisorAssignmentForm(props: any) {
  const {
    studentId,
    error,
    departmentalSupervisorId,
    setDepartmentalSupervisorId,
    industrialSupervisorId,
    setIndustrialSupervisorId,
    academicList,
    industrialList,
    academicSuggestions,
    industrialSuggestions,
    handleSave,
    isPending,
  } = props;

  return (
    <Card className="shadow-sm border-border/50">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-primary/10">
            <UserCheck className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle>Supervisors</CardTitle>
            <CardDescription>
              Select academic and industrial supervisors for this placement.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md border border-destructive/20">
            {error}
          </div>
        )}

        <div className="space-y-3">
          <Label htmlFor="departmental-supervisor" className="font-semibold">
            Academic Supervisor
          </Label>
          <Select
            value={departmentalSupervisorId}
            onValueChange={setDepartmentalSupervisorId}
          >
            <SelectTrigger
              id="departmental-supervisor"
              className="bg-background"
            >
              <SelectValue placeholder="Select academic supervisor" />
            </SelectTrigger>
            <SelectContent>
              {academicList.length > 0 ? (
                academicList.map((sup: any) => {
                  const isFull =
                    (sup.assignedStudents?.length || 0) >=
                    (sup.maxStudents || 5);
                  const isCurrentlyAssigned =
                    departmentalSupervisorId === sup.id;
                  return (
                    <SelectItem
                      key={sup.id}
                      value={sup.id}
                      disabled={isFull && !isCurrentlyAssigned}
                    >
                      {sup.name} - {sup.department?.name || "Cross-dept"} (
                      {sup.assignedStudents?.length || 0}/{sup.maxStudents || 5}
                      ){sup.suggestionReason && ` • ${sup.suggestionReason}`}
                      {isFull && !isCurrentlyAssigned && " - Full"}
                    </SelectItem>
                  );
                })
              ) : (
                <SelectItem value="none" disabled>
                  No supervisors available
                </SelectItem>
              )}
            </SelectContent>
          </Select>

          {academicSuggestions.length > 0 && (
            <div className="bg-blue-50/50 border border-blue-100 rounded p-2.5">
              <p className="text-[11px] text-blue-900 font-semibold uppercase tracking-wider mb-1">
                Recommended Academic
              </p>
              <p className="text-sm text-blue-800 font-medium">
                {academicSuggestions[0].name}{" "}
                <span className="text-blue-600/70 font-normal">
                  • {academicSuggestions[0].suggestionReason || "Available"}
                </span>
              </p>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <Label htmlFor="industrial-supervisor" className="font-semibold">
            Industrial Supervisor
          </Label>
          <Select
            value={industrialSupervisorId}
            onValueChange={setIndustrialSupervisorId}
          >
            <SelectTrigger id="industrial-supervisor" className="bg-background">
              <SelectValue placeholder="Select industrial supervisor" />
            </SelectTrigger>
            <SelectContent>
              {industrialList.length > 0 ? (
                industrialList.map((sup: any) => {
                  const isFull =
                    (sup.assignedStudents?.length || 0) >=
                    (sup.maxStudents || 10);
                  const isCurrentlyAssigned = industrialSupervisorId === sup.id;
                  return (
                    <SelectItem
                      key={sup.id}
                      value={sup.id}
                      disabled={isFull && !isCurrentlyAssigned}
                    >
                      {sup.name} - {sup.companyName || "Company"} (
                      {sup.assignedStudents?.length || 0}/
                      {sup.maxStudents || 10})
                      {sup.suggestionReason && ` • ${sup.suggestionReason}`}
                      {isFull && !isCurrentlyAssigned && " - Full"}
                    </SelectItem>
                  );
                })
              ) : (
                <SelectItem value="none" disabled>
                  No industrial supervisors available
                </SelectItem>
              )}
            </SelectContent>
          </Select>

          {industrialSuggestions.length > 0 && (
            <div className="bg-green-50/50 border border-green-100 rounded p-2.5">
              <p className="text-[11px] text-green-900 font-semibold uppercase tracking-wider mb-1">
                Recommended Industrial
              </p>
              <p className="text-sm text-green-800 font-medium">
                {industrialSuggestions[0].name}{" "}
                <span className="text-green-600/70 font-normal">
                  • {industrialSuggestions[0].suggestionReason || "Available"}
                </span>
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border/50">
          <Button
            onClick={handleSave}
            disabled={isPending}
            className="flex-1 sm:flex-none"
          >
            <Save className="h-4 w-4 mr-2" />
            {isPending ? "Saving..." : "Assign Supervisors"}
          </Button>
          <Button variant="outline" asChild className="flex-1 sm:flex-none">
            <Link href={`/coordinator/students/${studentId}`}>Cancel</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
