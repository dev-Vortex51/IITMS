import { Plus } from "lucide-react";
import { PageHeader } from "@/components/design-system";
import { Button } from "@/components/ui/button";

export function AssessmentsHeader() {
  return (
    <PageHeader
      title="Student Assessments"
      description="Create and manage workplace performance assessments"
      actions={
        <Button disabled>
          <Plus className="mr-2 h-4 w-4" />
          New Assessment
        </Button>
      }
    />
  );
}
