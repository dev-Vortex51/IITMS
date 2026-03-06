import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Users, Mail, Building } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export function StudentPersonalInfoCard({ student }: { student: any }) {
  const departmentName =
    typeof student.department === "object"
      ? student.department?.name
      : student.department || "N/A";

  const fullName =
    student.user?.firstName && student.user?.lastName
      ? `${student.user.firstName} ${student.user.lastName}`
      : "N/A";

  return (
    <Card className="shadow-sm border-border/50">
      <CardHeader className="border-b border-border/60">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-primary/10">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">Student Information</CardTitle>
            <CardDescription>Personal and academic details</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="rounded-md border border-border/60 overflow-hidden">
          <InfoRow label="Full Name" value={fullName} />
          <Separator />
          <InfoRow label="Matric Number" value={student.matricNumber || "N/A"} />
          <Separator />
          <InfoRow
            label="Email"
            value={student.user?.email || "N/A"}
            icon={<Mail className="h-3.5 w-3.5" />}
          />
          <Separator />
          <InfoRow label="Level" value={student.level || "N/A"} />
          <Separator />
          <InfoRow
            label="Department"
            value={departmentName}
            icon={<Building className="h-3.5 w-3.5" />}
          />
          <Separator />
          <InfoRow label="Session" value={student.session || "N/A"} />
        </div>
      </CardContent>
    </Card>
  );
}

function InfoRow({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 gap-1 p-3 md:grid-cols-[220px_1fr] md:items-center">
      <Label className="text-muted-foreground flex items-center gap-1.5 text-xs uppercase tracking-wider">
        {icon} {label}
      </Label>
      <p className="font-medium text-foreground text-sm">{value}</p>
    </div>
  );
}
