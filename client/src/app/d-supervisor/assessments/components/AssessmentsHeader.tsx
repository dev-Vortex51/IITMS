import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/design-system/page-header";

interface AssessmentsHeaderProps {
  onCreateClick: () => void;
}

export function AssessmentsHeader({ onCreateClick }: AssessmentsHeaderProps) {
  return (
    <PageHeader
      title="Student Assessments"
      description="Evaluate student performance and provide feedback"
      actions={
        <Button onClick={onCreateClick}>
          <Plus className="h-4 w-4 mr-2" />
          New Assessment
        </Button>
      }
    />
  );
}
