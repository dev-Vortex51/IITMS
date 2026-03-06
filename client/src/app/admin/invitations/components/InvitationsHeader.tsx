import { Plus } from "lucide-react";
import { PageHeader } from "@/components/design-system";
import { Button } from "@/components/ui/button";

interface InvitationsHeaderProps {
  onOpenCreate: () => void;
}

export function InvitationsHeader({ onOpenCreate }: InvitationsHeaderProps) {
  return (
    <PageHeader
      title="Invitations"
      description="Manage user invitations and onboarding"
      actions={
        <Button onClick={onOpenCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Send Invitation
        </Button>
      }
    />
  );
}
