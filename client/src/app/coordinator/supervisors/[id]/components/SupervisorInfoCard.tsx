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

export function SupervisorInfoCard({ supervisor, isDepartmental }: any) {
  const Icon = isDepartmental ? Building : Building2;
  const iconBg = isDepartmental
    ? "bg-blue-50 text-blue-600"
    : "bg-indigo-50 text-indigo-600";

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="pb-4 border-b border-border/50">
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
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <InfoItem label="Full Name" value={supervisor.name} />
          <InfoItem label="Email" value={supervisor.email} icon={Mail} />
          <InfoItem
            label="Phone Number"
            value={supervisor.phone}
            icon={Phone}
          />

          {isDepartmental ? (
            <>
              <InfoItem
                label="Department"
                value={
                  typeof supervisor.department === "object"
                    ? supervisor.department.name
                    : supervisor.department
                }
              />
              <InfoItem label="Staff ID" value={supervisor.staffId} />
              <InfoItem
                label="Specialization"
                value={supervisor.specialization}
              />
            </>
          ) : (
            <>
              <InfoItem
                label="Company Name"
                value={supervisor.companyName}
                icon={Building2}
              />
              <InfoItem
                label="Position"
                value={supervisor.position}
                icon={Briefcase}
              />
              <InfoItem
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

function InfoItem({ label, value, icon: Icon }: any) {
  return (
    <div className="space-y-1 min-w-0">
      <Label className="text-muted-foreground flex items-center gap-1.5 text-xs uppercase tracking-wider">
        {Icon && <Icon className="h-3.5 w-3.5" />}
        {label}
      </Label>
      <p className="font-medium text-sm sm:text-base truncate">
        {value || <span className="text-muted-foreground/50 italic">N/A</span>}
      </p>
    </div>
  );
}
