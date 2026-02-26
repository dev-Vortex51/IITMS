import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Users, Mail, Building } from "lucide-react";

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
      <CardHeader className="pb-4">
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
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <InfoField label="Full Name" value={fullName} />
          <InfoField
            label="Matric Number"
            value={student.matricNumber || "N/A"}
          />
          <InfoField
            label="Email"
            value={student.user?.email || "N/A"}
            icon={<Mail className="h-3.5 w-3.5" />}
          />
          <InfoField label="Level" value={student.level || "N/A"} />
          <InfoField
            label="Department"
            value={departmentName}
            icon={<Building className="h-3.5 w-3.5" />}
          />
          <InfoField label="Session" value={student.session || "N/A"} />
        </div>
      </CardContent>
    </Card>
  );
}

function InfoField({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-muted-foreground flex items-center gap-1.5 text-xs uppercase tracking-wider">
        {icon} {label}
      </Label>
      <p className="font-medium text-foreground">{value}</p>
    </div>
  );
}
