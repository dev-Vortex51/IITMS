"use client";

import { ExternalLink, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/design-system";
import type { TechnicalReportRecord } from "../types";

interface FinalReportSummaryCardProps {
  report: TechnicalReportRecord;
  onEdit: () => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
}

export function FinalReportSummaryCard({ report, onEdit, onSubmit, isSubmitting }: FinalReportSummaryCardProps) {
  const canEdit = report.status !== "approved";
  const canSubmit = report.status === "draft" || report.status === "rejected";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Final Technical Report
        </CardTitle>
        <CardDescription>Current submission and review status</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Status</span>
          <StatusBadge status={report.status} />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Title</p>
          <p className="font-medium">{report.title || "Untitled report"}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Abstract</p>
          <p className="text-sm">{report.abstract || "No abstract provided"}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Review Comment</p>
          <p className="text-sm">{report.reviewComment || "No review comment"}</p>
        </div>

        {report.documentPath ? (
          <a
            href={report.documentPath}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center text-sm text-primary hover:underline"
          >
            View uploaded document <ExternalLink className="ml-1 h-3 w-3" />
          </a>
        ) : (
          <p className="text-sm text-muted-foreground">No document uploaded yet.</p>
        )}

        <div className="flex gap-2">
          {canEdit ? (
            <Button variant="outline" onClick={onEdit}>
              Edit Report
            </Button>
          ) : null}
          {canSubmit ? (
            <Button onClick={onSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit for Review"}
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
