import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";

export function StudentHeader() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary">
          Students
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage and monitor student placements within your department.
        </p>
      </div>
      <Button asChild className="w-full sm:w-auto shrink-0">
        <Link href="/coordinator/invitations">
          <UserPlus className="mr-2 h-4 w-4" />
          Invite Student
        </Link>
      </Button>
    </div>
  );
}
