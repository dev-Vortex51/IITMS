import Link from "next/link";
import { UserCog } from "lucide-react";
import { PageHeader } from "@/components/design-system";
import { Button } from "@/components/ui/button";

export function CoordinatorsHeader() {
  return (
    <PageHeader
      title="Coordinators"
      description="Manage department coordinators and their assignments"
      actions={
        <Button asChild className="w-full sm:w-auto">
          <Link href="/admin/invitations">
            <UserCog className="mr-2 h-4 w-4" />
            Invite Coordinator
          </Link>
        </Button>
      }
    />
  );
}
