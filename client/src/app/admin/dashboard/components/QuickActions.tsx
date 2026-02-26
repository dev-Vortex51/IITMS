import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { School, Building, UserCog, Plus } from "lucide-react";
import Link from "next/link";

export function QuickActions() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold tracking-tight">Quick Actions</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-md transition-all border-border/50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                <School className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base">Create Faculty</CardTitle>
                <p className="text-sm text-muted-foreground">Add new faculty</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/admin/faculties">
                <Plus className="h-4 w-4 mr-2" /> New Faculty
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-all border-border/50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400">
                <Building className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base">Create Department</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Add new department
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/admin/departments">
                <Plus className="h-4 w-4 mr-2" /> New Department
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-all border-border/50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400">
                <UserCog className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base">Manage Coordinators</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Assign roles & access
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/admin/coordinators">View All Coordinators</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
