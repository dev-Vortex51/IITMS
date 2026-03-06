import { GraduationCap, Phone, School } from "lucide-react";

export function AcademicSupervisorProfile({ supervisor }: { supervisor: any }) {
  return (
    <div className="space-y-3">
      <DetailItem
        icon={<School className="h-4 w-4" />}
        label="Department"
        value={typeof supervisor.department === "object" ? supervisor.department?.name || "N/A" : "N/A"}
      />
      <DetailItem
        icon={<GraduationCap className="h-4 w-4" />}
        label="Specialization"
        value={supervisor.specialization || "Not specified"}
      />
      <DetailItem
        icon={<Phone className="h-4 w-4" />}
        label="Phone"
        value={supervisor.phone || "Not provided"}
      />
    </div>
  );
}

function DetailItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-md border border-border bg-background px-3 py-2.5">
      <div className="flex items-center gap-3 text-muted-foreground">
        {icon}
        <span className="text-sm font-medium">{label}</span>
      </div>
      <span className="text-sm font-medium text-foreground text-right">{value}</span>
    </div>
  );
}
