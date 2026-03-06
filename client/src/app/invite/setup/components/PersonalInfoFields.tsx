import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { SetupFormData } from "../types";

interface PersonalInfoFieldsProps {
  invitationEmail: string;
  formData: SetupFormData;
  onFieldChange: (field: keyof SetupFormData, value: string) => void;
}

export function PersonalInfoFields({
  invitationEmail,
  formData,
  onFieldChange,
}: PersonalInfoFieldsProps) {
  return (
    <>
      <div className="space-y-2">
        <Label>Email Address</Label>
        <Input value={invitationEmail} disabled className="bg-muted" />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="firstName">
            First Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="firstName"
            placeholder="Enter first name"
            value={formData.firstName}
            onChange={(event) => onFieldChange("firstName", event.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName">
            Last Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="lastName"
            placeholder="Enter last name"
            value={formData.lastName}
            onChange={(event) => onFieldChange("lastName", event.target.value)}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          type="tel"
          placeholder="+234 XXX XXX XXXX"
          value={formData.phone}
          onChange={(event) => onFieldChange("phone", event.target.value)}
        />
      </div>
    </>
  );
}
