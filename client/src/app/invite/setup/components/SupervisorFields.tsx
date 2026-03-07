import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { InvitationData, SetupFormData } from "../types";

interface SupervisorFieldsProps {
  role: string;
  invitation: InvitationData;
  formData: SetupFormData;
  onFieldChange: (field: keyof SetupFormData, value: string) => void;
}

export function SupervisorFields({
  role,
  invitation,
  formData,
  onFieldChange,
}: SupervisorFieldsProps) {
  if (role === "academic_supervisor") {
    return (
      <div className="border-t pt-4">
        <h3 className="mb-4 font-semibold">Academic Supervisor Information</h3>
        <div className="space-y-2">
          <Label htmlFor="academic-specialization">Specialization</Label>
          <Input
            id="academic-specialization"
            placeholder="e.g., Computer Science"
            value={formData.specialization}
            onChange={(event) => onFieldChange("specialization", event.target.value)}
          />
        </div>
      </div>
    );
  }

  if (role === "industrial_supervisor") {
    const hasInvitedCompanyName = Boolean(invitation.companyName?.trim());
    const hasInvitedCompanyAddress = Boolean(invitation.companyAddress?.trim());
    const hasInvitedPosition = Boolean(invitation.position?.trim());
    const hasInvitedExperience = invitation.yearsOfExperience !== undefined && invitation.yearsOfExperience !== null;

    const shouldAskCompanyName = !hasInvitedCompanyName;
    const shouldAskCompanyAddress = !hasInvitedCompanyAddress;
    const shouldAskPosition = !hasInvitedPosition;
    const shouldAskExperience = !hasInvitedExperience;

    const hasAnyMissing =
      shouldAskCompanyName ||
      shouldAskCompanyAddress ||
      shouldAskPosition ||
      shouldAskExperience;

    return (
      <div className="border-t pt-4">
        <h3 className="mb-4 font-semibold">Company & Professional Information</h3>
        <div className="space-y-4">
          <div className="rounded-md border border-border/60 bg-muted/20 p-3 text-sm">
            <p className="font-medium text-foreground">Provided with invitation</p>
            <div className="mt-2 space-y-1 text-muted-foreground">
              <p>
                Company:{" "}
                <span className="text-foreground">
                  {invitation.companyName || "Not provided"}
                </span>
              </p>
              <p>
                Address:{" "}
                <span className="text-foreground">
                  {invitation.companyAddress || "Not provided"}
                </span>
              </p>
              <p>
                Position:{" "}
                <span className="text-foreground">
                  {invitation.position || "Not provided"}
                </span>
              </p>
              <p>
                Experience:{" "}
                <span className="text-foreground">
                  {invitation.yearsOfExperience ?? "Not provided"}
                </span>
              </p>
            </div>
          </div>

          {hasAnyMissing ? (
            <div className="space-y-4 rounded-md border border-border/60 p-3">
              <p className="text-sm text-muted-foreground">
                Some details are missing from the invitation. Please complete the missing fields.
              </p>

              {shouldAskCompanyName ? (
                <div className="space-y-2">
                  <Label htmlFor="companyName">
                    Company Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="companyName"
                    placeholder="e.g., Tech Solutions Ltd"
                    value={formData.companyName}
                    onChange={(event) =>
                      onFieldChange("companyName", event.target.value)
                    }
                    required
                  />
                </div>
              ) : null}

              {shouldAskCompanyAddress ? (
                <div className="space-y-2">
                  <Label htmlFor="companyAddress">Company Address</Label>
                  <Input
                    id="companyAddress"
                    placeholder="e.g., 123 Main St, City"
                    value={formData.companyAddress}
                    onChange={(event) =>
                      onFieldChange("companyAddress", event.target.value)
                    }
                  />
                </div>
              ) : null}

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {shouldAskPosition ? (
                  <div className="space-y-2">
                    <Label htmlFor="position">Position/Title</Label>
                    <Input
                      id="position"
                      placeholder="e.g., Senior Engineer"
                      value={formData.position}
                      onChange={(event) =>
                        onFieldChange("position", event.target.value)
                      }
                    />
                  </div>
                ) : null}
                {shouldAskExperience ? (
                  <div className="space-y-2">
                    <Label htmlFor="yearsOfExperience">Years of Experience</Label>
                    <Input
                      id="yearsOfExperience"
                      type="number"
                      min="0"
                      placeholder="e.g., 5"
                      value={formData.yearsOfExperience}
                      onChange={(event) =>
                        onFieldChange("yearsOfExperience", event.target.value)
                      }
                    />
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="industrial-specialization">Specialization</Label>
            <Input
              id="industrial-specialization"
              placeholder="e.g., Software Engineering"
              value={formData.specialization}
              onChange={(event) => onFieldChange("specialization", event.target.value)}
            />
          </div>
        </div>
      </div>
    );
  }

  return null;
}
