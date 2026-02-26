import { useState } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";

export default function CreateDepartment({ faculties, createMutation }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", code: "", faculty: "" });
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!formData.faculty) return setError("Please select a faculty");

    createMutation.mutate(formData, {
      onSuccess: () => {
        setIsOpen(false);
        setFormData({ name: "", code: "", faculty: "" });
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Create Department</span>
          <span className="sm:hidden">Create</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Department</DialogTitle>
          <DialogDescription>
            Add a new department to a faculty
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Department Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
              placeholder="e.g., Computer Science"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="code">Department Code *</Label>
            <Input
              id="code"
              value={formData.code}
              onChange={(e) =>
                setFormData({ ...formData, code: e.target.value })
              }
              required
              placeholder="e.g., CSC"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="faculty">Faculty *</Label>
            <Select
              value={formData.faculty}
              onValueChange={(val) =>
                setFormData({ ...formData, faculty: val })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select faculty" />
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
          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
              {error}
            </div>
          )}
          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={createMutation.isPending}
              className="flex-1"
            >
              {createMutation.isPending ? "Creating..." : "Create"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
