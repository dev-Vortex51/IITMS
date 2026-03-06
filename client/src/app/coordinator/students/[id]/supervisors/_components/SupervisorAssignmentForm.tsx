import Link from "next/link";
import { useState } from "react";
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
import {
  BadgeCheck,
  Lightbulb,
  Save,
  Sparkles,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

export function SupervisorAssignmentForm(props: any) {
  const [showAcademicRecommendation, setShowAcademicRecommendation] =
    useState(true);
  const [showIndustrialRecommendation, setShowIndustrialRecommendation] =
    useState(true);

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
  const hasAcademicAssigned = Boolean(departmentalSupervisorId);
  const hasIndustrialAssigned = Boolean(industrialSupervisorId);

  return (
    <Card className="shadow-sm border-border/50 overflow-hidden">
      <CardHeader className="border-b border-border/60 bg-muted/20">
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
      <CardContent className="space-y-6 pt-6">
        {error && (
          <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md border border-destructive/20">
            {error}
          </div>
        )}

        <div className="rounded-md border border-border/60 p-4 space-y-3">
          <Label htmlFor="departmental-supervisor" className="font-semibold">
            Academic Supervisor
          </Label>
          <Select
            value={departmentalSupervisorId}
            onValueChange={setDepartmentalSupervisorId}
          >
            <SelectTrigger id="departmental-supervisor" className="bg-background">
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
          {academicSuggestions.length > 0 &&
          showAcademicRecommendation &&
          !hasAcademicAssigned ? (
            <RecommendedMatchCard
              title="Recommended Academic Supervisor"
              suggestion={academicSuggestions[0]}
              onUse={() => setDepartmentalSupervisorId(academicSuggestions[0].id)}
              onDismiss={() => setShowAcademicRecommendation(false)}
            />
          ) : null}
        </div>

        <div className="rounded-md border border-border/60 p-4 space-y-3">
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

          {industrialSuggestions.length > 0 &&
          showIndustrialRecommendation &&
          !hasIndustrialAssigned ? (
            <RecommendedMatchCard
              title="Recommended Industrial Supervisor"
              suggestion={industrialSuggestions[0]}
              onUse={() => setIndustrialSupervisorId(industrialSuggestions[0].id)}
              onDismiss={() => setShowIndustrialRecommendation(false)}
            />
          ) : null}
        </div>

        <Separator />

        <div className="flex flex-col sm:flex-row gap-3">
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

function RecommendedMatchCard({
  title,
  suggestion,
  onUse,
  onDismiss,
}: {
  title: string;
  suggestion: any;
  onUse: () => void;
  onDismiss: () => void;
}) {
  const assigned = suggestion?.assignedStudents?.length || 0;
  const capacity = suggestion?.maxStudents || 0;
  const utilization =
    capacity > 0 ? Math.min(100, Math.round((assigned / capacity) * 100)) : 0;

  const reasons = suggestion?.suggestionReason
    ? suggestion.suggestionReason
        .split(/[;,.]/)
        .map((value: string) => value.trim())
        .filter(Boolean)
        .slice(0, 3)
    : ["Best available fit"];

  return (
    <div className="rounded-md border border-border/60 bg-muted/30 p-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-muted-foreground" />
            {title}
          </p>
          <p className="mt-1 text-sm font-semibold text-foreground truncate">
            {suggestion?.name || "Recommended Supervisor"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={onUse}>
            <BadgeCheck className="h-3.5 w-3.5 mr-1.5" />
            Use Recommendation
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onDismiss}
            aria-label="Dismiss recommendation"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="mt-3 rounded bg-background/80 p-2.5 border border-border/60">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" />
            Current Load
          </span>
          <span className="font-medium text-foreground">
            {assigned}/{capacity || "N/A"}
          </span>
        </div>
        {capacity > 0 ? (
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${utilization}%` }}
            />
          </div>
        ) : null}
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {reasons.map((reason: string) => (
          <Badge
            key={reason}
            variant="secondary"
            className="bg-background text-foreground hover:bg-background"
          >
            <Lightbulb className="h-3 w-3 mr-1" />
            {reason}
          </Badge>
        ))}
      </div>
    </div>
  );
}
