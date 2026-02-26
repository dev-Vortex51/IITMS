import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { School, Building } from "lucide-react";

interface RecentActivityProps {
  faculties: any[];
  departments: any[];
}

export function RecentActivity({
  faculties,
  departments,
}: RecentActivityProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="shadow-sm border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">Recent Faculties</CardTitle>
        </CardHeader>
        <CardContent>
          {faculties.length > 0 ? (
            <div className="space-y-3">
              {faculties.slice(0, 5).map((faculty) => (
                <div
                  key={faculty.id}
                  className="flex items-center justify-between p-3 border border-border/50 rounded-xl bg-muted/10 hover:bg-muted/30 transition-colors"
                >
                  <div>
                    <p className="font-medium text-sm">{faculty.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Code: {faculty.code}
                    </p>
                  </div>
                  <div className="p-2 bg-background rounded-md shadow-sm border border-border/50">
                    <School className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-sm text-muted-foreground">
              No faculties yet
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-sm border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">Recent Departments</CardTitle>
        </CardHeader>
        <CardContent>
          {departments.length > 0 ? (
            <div className="space-y-3">
              {departments.slice(0, 5).map((dept) => (
                <div
                  key={dept.id}
                  className="flex items-center justify-between p-3 border border-border/50 rounded-xl bg-muted/10 hover:bg-muted/30 transition-colors"
                >
                  <div>
                    <p className="font-medium text-sm">{dept.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {typeof dept.faculty === "object"
                        ? dept.faculty.name
                        : "Faculty"}
                    </p>
                  </div>
                  <div className="p-2 bg-background rounded-md shadow-sm border border-border/50">
                    <Building className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-sm text-muted-foreground">
              No departments yet
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
