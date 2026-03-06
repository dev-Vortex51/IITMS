import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/design-system";
import { Button } from "@/components/ui/button";

export function AcademicSupervisorsHeader() {
  return (
    <PageHeader
      title="Academic Supervisors"
      description="Manage academic supervisors (up to 10 students cross-department)"
      actions={
        <Link href="/admin/invitations">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Invite Academic Supervisor
          </Button>
        </Link>
      }
    />
  );
}
