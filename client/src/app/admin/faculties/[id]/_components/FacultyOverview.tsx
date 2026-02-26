import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { School, Edit2, Hash, User } from "lucide-react";

export default function FacultyOverview({ faculty, updateMutation }: any) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: "", code: "", dean: "" });

  useEffect(() => {
    if (faculty && isEditing) {
      setFormData({
        name: faculty.name || "",
        code: faculty.code || "",
        dean: faculty.dean || "",
      });
    }
  }, [faculty, isEditing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData, {
      onSuccess: () => setIsEditing(false),
    });
  };

  return (
    <Card className="border-border/50 shadow-sm overflow-hidden bg-card/50">
      <CardHeader className="border-b border-border/40 pb-4 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <School className="h-4 w-4 text-muted-foreground" />
          <CardTitle className="text-base font-medium">Overview</CardTitle>
        </div>
        {!isEditing && (
          <Button
            onClick={() => setIsEditing(true)}
            variant="ghost"
            size="sm"
            className="h-8 text-xs text-muted-foreground hover:text-foreground"
          >
            <Edit2 className="h-3.5 w-3.5 mr-1.5" /> Edit
          </Button>
        )}
      </CardHeader>

      <CardContent className="pt-6">
        {isEditing ? (
          <form
            onSubmit={handleSubmit}
            className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200"
          >
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">
                Faculty Name
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
                Code
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
                Dean
              </Label>
              <Input
                className="bg-background shadow-none"
                value={formData.dean}
                onChange={(e) =>
                  setFormData({ ...formData, dean: e.target.value })
                }
              />
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
          <div className="space-y-6">
            <DetailItem
              icon={<Hash className="h-4 w-4" />}
              label="Faculty Code"
              value={faculty.code}
            />
            <DetailItem
              icon={<User className="h-4 w-4" />}
              label="Dean of Faculty"
              value={faculty.dean || "Not assigned"}
            />
          </div>
        )}
      </CardContent>
    </Card>
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
    <div className="flex items-center justify-between group">
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
