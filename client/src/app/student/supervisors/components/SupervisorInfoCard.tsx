import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Briefcase, Building2, Mail, Phone, User } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import type { Supervisor } from "@/types/models";

interface SupervisorInfoCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  iconClassName: string;
  supervisor: Supervisor;
  showDepartment?: boolean;
  showCompany?: boolean;
}

export function SupervisorInfoCard({
  title,
  description,
  icon: Icon,
  iconClassName,
  supervisor,
  showDepartment,
  showCompany,
}: SupervisorInfoCardProps) {
  const supervisorName =
    supervisor.name ||
    (typeof supervisor.user === "object" && supervisor.user
      ? `${supervisor.user.firstName || ""} ${supervisor.user.lastName || ""}`.trim()
      : "") ||
    "Not available";
  const supervisorEmail =
    supervisor.email ||
    (typeof supervisor.user === "object" ? supervisor.user.email : undefined);
  const supervisorPhone =
    supervisor.phone ||
    supervisor.phoneNumber ||
    (typeof supervisor.user === "object" ? (supervisor.user as any).phone : undefined);
  const companyName = supervisor.company || supervisor.companyName;
  const designation = supervisor.designation || supervisor.position;

  return (
    <Card className="shadow-sm border-border/50">
      <CardHeader className="border-b border-border/60">
        <div className="flex flex-wrap items-center gap-3">
          <div className={iconClassName}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="rounded-md border border-border/60 overflow-hidden">
          <InfoRow label="Name" icon={<User className="h-4 w-4" />} value={supervisorName} />
          <Separator />
          <InfoRow
            label="Email"
            icon={<Mail className="h-4 w-4" />}
            value={
              supervisorEmail ? (
                <a href={`mailto:${supervisorEmail}`} className="text-primary hover:underline">
                  {supervisorEmail}
                </a>
              ) : (
                "N/A"
              )
            }
          />
          <Separator />
          <InfoRow
            label="Phone"
            icon={<Phone className="h-4 w-4" />}
            value={
              supervisorPhone ? (
                <a href={`tel:${supervisorPhone}`} className="text-primary hover:underline">
                  {supervisorPhone}
                </a>
              ) : (
                "N/A"
              )
            }
          />
          {showDepartment ? (
            <>
              <Separator />
              <InfoRow
                label="Department"
                icon={<Building2 className="h-4 w-4" />}
                value={
                  supervisor.department
                    ? typeof supervisor.department === "object"
                      ? supervisor.department.name
                      : supervisor.department
                    : "N/A"
                }
              />
            </>
          ) : null}
          {showCompany ? (
            <>
              <Separator />
              <InfoRow
                label="Company"
                icon={<Briefcase className="h-4 w-4" />}
                value={companyName || "N/A"}
              />
            </>
          ) : null}
          {designation ? (
            <>
              <Separator />
              <InfoRow label="Designation" value={designation} />
            </>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

interface InfoRowProps {
  label: string;
  icon?: ReactNode;
  value: ReactNode;
}

function InfoRow({ label, icon, value }: InfoRowProps) {
  return (
    <div className="grid grid-cols-1 gap-1 p-3 md:grid-cols-[220px_1fr] md:items-center">
      <Label className="text-muted-foreground flex items-center gap-1.5 text-xs uppercase tracking-wider">
        {icon}
        {label}
      </Label>
      <p className="font-medium text-sm">{value}</p>
    </div>
  );
}
