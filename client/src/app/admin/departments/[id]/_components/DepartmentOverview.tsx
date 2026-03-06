import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building, Edit2, Hash, School, GraduationCap } from "lucide-react";

export default function DepartmentOverview({
  department,
  faculties,
  updateMutation,
}: any) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: "", code: "", faculty: "" });

  useEffect(() => {
    if (department && isEditing) {
      setFormData({
        name: department.name || "",
        code: department.code || "",
        faculty:
          typeof department.faculty === "object"
            ? department.faculty.id
            : department.faculty || "",
      });
    }
  }, [department, isEditing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData, {
      onSuccess: () => setIsEditing(false),
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Building className="h-4 w-4" />
          <span className="text-sm font-medium">Department profile</span>
        </div>
        {!isEditing ? (
          <Button
            onClick={() => setIsEditing(true)}
            variant="ghost"
            size="sm"
            className="h-8 text-xs text-muted-foreground hover:text-foreground"
          >
            <Edit2 className="h-3.5 w-3.5 mr-1.5" /> Edit
          </Button>
        ) : null}
      </div>

      {isEditing ? (
        <form
          onSubmit={handleSubmit}
          className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">
              Department Name
            </Label>
            <Input
              className="bg-background shadow-none"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">
              Department Code
            </Label>
            <Input
              className="bg-background shadow-none"
              value={formData.code}
              onChange={(e) =>
                setFormData({ ...formData, code: e.target.value })
              }
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">
              Faculty
            </Label>
            <Select
              value={formData.faculty}
              onValueChange={(v) => setFormData({ ...formData, faculty: v })}
            >
              <SelectTrigger className="bg-background shadow-none">
                <SelectValue placeholder="Select a faculty" />
              </SelectTrigger>
              <SelectContent>
                {faculties.map((f: any) => (
                  <SelectItem key={f.id} value={f.id}>
                    {f.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2 pt-4">
            <Button
              type="submit"
              disabled={updateMutation.isPending}
              size="sm"
              className="w-full"
            >
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full shadow-none"
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <div className="space-y-3">
          <DetailItem
            icon={<Hash className="h-4 w-4" />}
            label="Department Code"
            value={department.code}
          />
          <DetailItem
            icon={<School className="h-4 w-4" />}
            label="Faculty"
            value={
              typeof department.faculty === "object"
                ? department.faculty?.name || "N/A"
                : "N/A"
            }
          />
          <DetailItem
            icon={<GraduationCap className="h-4 w-4" />}
            label="Coordinator Status"
            value={
              department.coordinators?.length
                ? `${department.coordinators.length} Assigned`
                : "None Assigned"
            }
          />
        </div>
      )}
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
      <span className="text-sm font-medium text-foreground text-right">
        {value}
      </span>
    </div>
  );
}
