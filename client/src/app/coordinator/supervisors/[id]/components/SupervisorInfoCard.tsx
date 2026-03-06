import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Building,
  Building2,
  Mail,
  Phone,
  Briefcase,
  MapPin,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

export function SupervisorInfoCard({ supervisor, isDepartmental }: any) {
  const Icon = isDepartmental ? Building : Building2;
  const iconBg = isDepartmental
    ? "bg-blue-50 text-blue-600"
    : "bg-indigo-50 text-indigo-600";

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-lg shrink-0 ${iconBg}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-lg">Contact Information</CardTitle>
            <CardDescription>
              {isDepartmental
                ? "Academic and departmental"
                : "Company and professional"}{" "}
              details
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="rounded-md border border-border/60 overflow-hidden">
          <InfoRow label="Full Name" value={supervisor.name} />
          <Separator />
          <InfoRow label="Email" value={supervisor.email} icon={Mail} />
          <Separator />
          <InfoRow label="Phone Number" value={supervisor.phone} icon={Phone} />
          <Separator />
          {isDepartmental ? (
            <>
              <InfoRow
                label="Department"
                value={
                  supervisor.department &&
                  typeof supervisor.department === "object"
                    ? supervisor.department.name
                    : supervisor.department
                }
                icon={Building}
              />
              <Separator />
              <InfoRow label="Staff ID" value={supervisor.staffId} />
              <Separator />
              <InfoRow
                label="Specialization"
                value={supervisor.specialization}
              />
            </>
          ) : (
            <>
              <InfoRow
                label="Company Name"
                value={supervisor.companyName}
                icon={Building2}
              />
              <Separator />
              <InfoRow label="Position" value={supervisor.position} icon={Briefcase} />
              <Separator />
              <InfoRow
                label="Company Address"
                value={supervisor.companyAddress}
                icon={MapPin}
              />
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function InfoRow({ label, value, icon: Icon }: any) {
  return (
    <div className="grid grid-cols-1 gap-1 p-3 md:grid-cols-[220px_1fr] md:items-center">
      <Label className="text-muted-foreground flex items-center gap-1.5 text-xs uppercase tracking-wider">
        {Icon && <Icon className="h-3.5 w-3.5" />}
        {label}
      </Label>
      <p className="font-medium text-sm truncate">
        {value || <span className="text-muted-foreground/50 italic">N/A</span>}
      </p>
    </div>
  );
}
