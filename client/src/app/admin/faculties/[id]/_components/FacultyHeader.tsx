import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CalendarDays, Building } from "lucide-react";

export default function FacultyHeader({
  faculty,
  departmentCount,
}: {
  faculty: any;
  departmentCount: number;
}) {
  return (
    <div className="flex flex-col gap-6">
      <Button
        variant="ghost"
        size="sm"
        asChild
        className="w-fit -ml-3 text-muted-foreground hover:text-foreground"
      >
        <Link href="/admin/faculties">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Directory
        </Link>
      </Button>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border/40 pb-6">
        <div className="space-y-3">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground leading-none">
            {faculty.name}
          </h1>
        </div>
      </div>
    </div>
  );
}
