import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, XCircle } from "lucide-react";

interface Props {
  remarks: string;
  setRemarks: (v: string) => void;
  error: string;
  handleApprove: () => void;
  handleReject: () => void;
  isPending: boolean;
}

export function PlacementReviewAction({
  remarks,
  setRemarks,
  error,
  handleApprove,
  handleReject,
  isPending,
}: Props) {
  return (
    <Card className="shadow-sm border-primary/20 bg-primary/5">
      <CardHeader>
        <CardTitle>Review Placement</CardTitle>
        <CardDescription>
          Approve or reject this placement application
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="remarks" className="font-semibold">
            Remarks{" "}
            <span className="text-muted-foreground font-normal">
              (Required for rejection)
            </span>
          </Label>
          <Textarea
            id="remarks"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Add your remarks here..."
            rows={4}
            className="bg-background"
          />
        </div>

        {error && (
          <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md border border-destructive/20">
            {error}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button
            onClick={handleApprove}
            disabled={isPending}
            className="flex-1"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            {isPending ? "Processing..." : "Approve Placement"}
          </Button>
          <Button
            onClick={handleReject}
            disabled={isPending}
            variant="destructive"
            className="flex-1"
          >
            <XCircle className="h-4 w-4 mr-2" />
            {isPending ? "Processing..." : "Reject Placement"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
