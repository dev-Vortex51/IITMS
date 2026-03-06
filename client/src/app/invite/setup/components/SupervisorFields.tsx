import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { SetupFormData } from "../types";

interface SupervisorFieldsProps {
  role: string;
  formData: SetupFormData;
  onFieldChange: (field: keyof SetupFormData, value: string) => void;
}

export function SupervisorFields({
  role,
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
    return (
      <div className="border-t pt-4">
        <h3 className="mb-4 font-semibold">Company & Professional Information</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="companyName">
              Company Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="companyName"
              placeholder="e.g., Tech Solutions Ltd"
              value={formData.companyName}
              onChange={(event) => onFieldChange("companyName", event.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="companyAddress">Company Address</Label>
            <Input
              id="companyAddress"
              placeholder="e.g., 123 Main St, City"
              value={formData.companyAddress}
              onChange={(event) => onFieldChange("companyAddress", event.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="position">Position/Title</Label>
              <Input
                id="position"
                placeholder="e.g., Senior Engineer"
                value={formData.position}
                onChange={(event) => onFieldChange("position", event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="yearsOfExperience">Years of Experience</Label>
              <Input
                id="yearsOfExperience"
                type="number"
                min="0"
                placeholder="e.g., 5"
                value={formData.yearsOfExperience}
                onChange={(event) => onFieldChange("yearsOfExperience", event.target.value)}
              />
            </div>
          </div>

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
