import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
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
} from "@/components/ui/dialog";
import adminService from "@/services/admin.service";

export default function AssignCoordinator({
  department,
  onClose,
  assignMutation,
}: any) {
  const [selectedCoordinator, setSelectedCoordinator] = useState("");

  // Reset local state when a new department is selected
  useEffect(() => {
    setSelectedCoordinator("");
  }, [department]);

  const { data: coordinatorsData } = useQuery({
    queryKey: ["department-coordinators", department?.id],
    queryFn: () =>
      adminService.departmentService.getAvailableCoordinatorsForDepartment(
        department.id,
      ),
    enabled: !!department?.id,
  });

  const availableCoordinators = coordinatorsData?.data || [];
  const isOpen = !!department;

  const handleSubmit = () => {
    if (department && selectedCoordinator) {
      assignMutation.mutate(
        { departmentId: department.id, coordinatorId: selectedCoordinator },
        { onSuccess: () => onClose() },
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Coordinator</DialogTitle>
          <DialogDescription>
            Assign a coordinator to {department?.name}. Only available
            coordinators are shown.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Select Coordinator</Label>
            <Select
              value={selectedCoordinator}
              onValueChange={setSelectedCoordinator}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a coordinator" />
              </SelectTrigger>
              <SelectContent>
                {availableCoordinators.map((c: any) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.firstName} {c.lastName} ({c.email}){" "}
                    {c.department ? "- Currently Assigned" : "- Available"}
                  </SelectItem>
                ))}
                {availableCoordinators.length === 0 && (
                  <div className="p-2 text-sm text-muted-foreground text-center">
                    No available coordinators.
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleSubmit}
              disabled={!selectedCoordinator || assignMutation.isPending}
              className="flex-1"
            >
              {assignMutation.isPending ? "Assigning..." : "Assign Coordinator"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
