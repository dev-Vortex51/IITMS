"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { attendanceService } from "@/services/attendance.service";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { CalendarIcon, Send } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function AbsenceRequestForm() {
  const [date, setDate] = useState<Date>();
  const [reason, setReason] = useState("");
  const queryClient = useQueryClient();

  const submitMutation = useMutation({
    mutationFn: (data: { date: string; reason: string }) =>
      attendanceService.submitAbsenceRequest(data),
    onSuccess: () => {
      toast.success("Absence request submitted successfully!");
      setDate(undefined);
      setReason("");
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to submit absence request"
      );
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!date) {
      toast.error("Please select a date");
      return;
    }

    if (!reason || reason.length < 10) {
      toast.error("Please provide a reason (at least 10 characters)");
      return;
    }

    submitMutation.mutate({
      date: date.toISOString(),
      reason,
    });
  };

  const characterCount = reason.length;
  const isValid = characterCount >= 10 && characterCount <= 500;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Request Absence</CardTitle>
        <CardDescription>
          Submit a request for an excused absence with a valid reason
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Date Picker */}
          <div className="space-y-2">
            <Label htmlFor="date">Date of Absence *</Label>
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              <Input
                id="date"
                type="date"
                value={date ? format(date, "yyyy-MM-dd") : ""}
                onChange={(e) => {
                  if (e.target.value) {
                    const [year, month, day] = e.target.value.split("-");
                    setDate(
                      new Date(
                        parseInt(year),
                        parseInt(month) - 1,
                        parseInt(day)
                      )
                    );
                  } else {
                    setDate(undefined);
                  }
                }}
                className="flex-1"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              You can request absence for past or future dates
            </p>
          </div>

          {/* Reason Textarea */}
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Absence *</Label>
            <Textarea
              id="reason"
              placeholder="Please provide a detailed reason for your absence (e.g., medical appointment, family emergency, etc.)"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              maxLength={500}
              className={cn(
                "resize-none",
                characterCount > 0 &&
                  !isValid &&
                  characterCount < 10 &&
                  "border-orange-500",
                characterCount > 0 && isValid && "border-green-500"
              )}
            />
            <div className="flex items-center justify-between text-xs">
              <span
                className={cn(
                  "text-muted-foreground",
                  characterCount > 0 &&
                    characterCount < 10 &&
                    "text-orange-600",
                  isValid && "text-green-600"
                )}
              >
                {characterCount}/500 characters
                {characterCount > 0 && characterCount < 10 && (
                  <span className="ml-2">(Minimum 10 characters required)</span>
                )}
              </span>
            </div>
          </div>

          {/* Info Box */}
          <div className="rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700">
            <p className="font-medium mb-1">📋 Important Notes:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Your absence request will be reviewed by your supervisor</li>
              <li>Approval is not guaranteed - provide clear, valid reasons</li>
              <li>
                If approved, the absence will be marked as &quot;Excused
                Absence"
              </li>
              <li>Supporting documents may be required for verification</li>
            </ul>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={!date || !isValid || submitMutation.isPending}
            className="w-full"
            size="lg"
          >
            {submitMutation.isPending ? (
              <>
                <Send className="mr-2 h-4 w-4 animate-pulse" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Submit Absence Request
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
