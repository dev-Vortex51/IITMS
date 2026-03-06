import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SetupFormData } from "../types";

interface StudentAcademicFieldsProps {
  formData: SetupFormData;
  onFieldChange: (field: keyof SetupFormData, value: string) => void;
}

export function StudentAcademicFields({
  formData,
  onFieldChange,
}: StudentAcademicFieldsProps) {
  return (
    <div className="border-t pt-4">
      <h3 className="mb-4 font-semibold">Academic Information</h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="matricNumber">
            Matric Number <span className="text-destructive">*</span>
          </Label>
          <Input
            id="matricNumber"
            placeholder="e.g., CSC/2020/001"
            value={formData.matricNumber}
            onChange={(event) => onFieldChange("matricNumber", event.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="level">
            Level <span className="text-destructive">*</span>
          </Label>
          <Select value={formData.level} onValueChange={(value) => onFieldChange("level", value)}>
            <SelectTrigger id="level">
              <SelectValue placeholder="Select level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="100">100 Level</SelectItem>
              <SelectItem value="200">200 Level</SelectItem>
              <SelectItem value="300">300 Level</SelectItem>
              <SelectItem value="400">400 Level</SelectItem>
              <SelectItem value="500">500 Level</SelectItem>
              <SelectItem value="600">600 Level</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="session">
            Session <span className="text-destructive">*</span>
          </Label>
          <Input
            id="session"
            placeholder="e.g., 2023/2024"
            value={formData.session}
            onChange={(event) => onFieldChange("session", event.target.value)}
            required
          />
        </div>
      </div>
    </div>
  );
}
