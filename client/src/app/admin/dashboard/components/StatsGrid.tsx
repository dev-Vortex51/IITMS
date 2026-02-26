import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { School, Building, Users, TrendingUp } from "lucide-react";

interface StatsGridProps {
  stats: {
    totalFaculties: number;
    totalDepartments: number;
    totalStudents: number;
    activePlacements: number;
  };
}

export function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="shadow-sm border-border/50">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Faculties
          </CardTitle>
          <School className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            {stats.totalFaculties}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Registered faculties
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-border/50">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Departments
          </CardTitle>
          <Building className="h-4 w-4 text-purple-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            {stats.totalDepartments}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Active departments
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-border/50">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Students
          </CardTitle>
          <Users className="h-4 w-4 text-amber-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            {stats.totalStudents}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Total registered students
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-border/50">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Active Placements
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-emerald-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {stats.activePlacements}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Approved placements
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
