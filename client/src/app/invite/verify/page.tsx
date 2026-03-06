"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import invitationService from "@/services/invitation.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InvitePageShell } from "../setup/components/InvitePageShell";

export default function VerifyInvitationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [verificationStatus, setVerificationStatus] = useState<
    "verifying" | "success" | "error"
  >("verifying");

  const { data, error } = useQuery({
    queryKey: ["verify-invitation", token],
    queryFn: () => invitationService.verifyToken(token!),
    enabled: !!token,
    retry: false,
  });

  useEffect(() => {
    if (!token) {
      setVerificationStatus("error");
      return;
    }

    if (data?.success) {
      setVerificationStatus("success");
      setTimeout(() => {
        router.push(`/invite/setup?token=${token}`);
      }, 2000);
    }

    if (error) {
      setVerificationStatus("error");
    }
  }, [data, error, token, router]);

  return (
    <InvitePageShell>
      <Card className="w-full border-border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Invitation Verification</CardTitle>
          <CardDescription>We are validating your invitation token.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {verificationStatus === "verifying" ? (
            <div className="flex items-start gap-3 rounded-md border border-border/60 bg-muted/20 p-4">
              <Loader2 className="mt-0.5 h-5 w-5 animate-spin text-primary" />
              <div>
                <p className="text-sm font-semibold text-foreground">Verifying your invitation...</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Please wait while we validate your link.
                </p>
              </div>
            </div>
          ) : null}

          {verificationStatus === "success" ? (
            <div className="flex items-start gap-3 rounded-md border border-emerald-200 bg-emerald-50 p-4">
              <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" />
              <div>
                <p className="text-sm font-semibold text-emerald-700">Invitation verified</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Redirecting you to complete your account setup...
                </p>
              </div>
            </div>
          ) : null}

          {verificationStatus === "error" ? (
            <div className="space-y-4">
              <div className="flex items-start gap-3 rounded-md border border-destructive/30 bg-destructive/10 p-4">
                <XCircle className="mt-0.5 h-5 w-5 text-destructive" />
                <div>
                  <p className="text-sm font-semibold text-destructive">Invalid or expired invitation</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                  {(error as any)?.response?.data?.message ||
                    "This invitation link is invalid or has expired. Please contact your administrator for a new invitation."}
                  </p>
                </div>
              </div>
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Link href="/">
                  <Button variant="outline" className="w-full sm:w-auto">Go to Homepage</Button>
                </Link>
                <Link href="/login">
                  <Button className="w-full sm:w-auto">Go to Login</Button>
                </Link>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </InvitePageShell>
  );
}
