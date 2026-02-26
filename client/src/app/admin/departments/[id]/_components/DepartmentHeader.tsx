import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CalendarDays, Users, Briefcase } from "lucide-react";

export default function DepartmentHeader({ department }: { department: any }) {
  return (
    <div className="flex flex-col gap-6">
      <Button
        variant="ghost"
        size="sm"
        asChild
        className="w-fit -ml-3 text-muted-foreground hover:text-foreground"
      >
        <Link href="/admin/departments">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Departments
        </Link>
      </Button>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border/40 pb-6">
        <div className="space-y-3">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground leading-none">
            {department.name}
          </h1>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
          <StatMiniCard
            label="Students"
            value={department.students?.length || 0}
            icon={<Users className="h-3.5 w-3.5" />}
          />
          <StatMiniCard
            label="Placements"
            value="0"
            icon={<Briefcase className="h-3.5 w-3.5" />}
          />
        </div>
      </div>
    </div>
  );
}

function StatMiniCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-card border border-border/50 px-4 py-3 rounded-xl min-w-[120px] shadow-sm flex flex-col gap-1">
      <div className="flex items-center gap-1.5 text-muted-foreground text-[11px] font-medium uppercase tracking-wider">
        {icon} {label}
      </div>
      <div className="text-2xl font-semibold tracking-tight">{value}</div>
    </div>
  );
}
