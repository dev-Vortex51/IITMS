"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import invitationService from "@/services/invitation.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle, Mail } from "lucide-react";
import Link from "next/link";

export default function VerifyInvitationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [verificationStatus, setVerificationStatus] = useState<
    "verifying" | "success" | "error"
  >("verifying");

  const { data, isLoading, error } = useQuery({
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
      // Redirect to setup page after a short delay
      setTimeout(() => {
        router.push(`/invite/setup?token=${token}`);
      }, 2000);
    }

    if (error) {
      setVerificationStatus("error");
    }
  }, [data, error, token, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl">
            Verifying Invitation
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-6">
          {verificationStatus === "verifying" && (
            <>
              <Loader2 className="h-16 w-16 animate-spin text-primary" />
              <div className="text-center">
                <p className="text-lg font-semibold">
                  Verifying your invitation...
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Please wait while we verify your invitation link
                </p>
              </div>
            </>
          )}

          {verificationStatus === "success" && (
            <>
              <CheckCircle2 className="h-16 w-16 text-green-600" />
              <div className="text-center">
                <p className="text-lg font-semibold text-green-600">
                  Invitation Verified!
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Redirecting you to complete your account setup...
                </p>
              </div>
            </>
          )}

          {verificationStatus === "error" && (
            <>
              <XCircle className="h-16 w-16 text-destructive" />
              <div className="text-center">
                <p className="text-lg font-semibold text-destructive">
                  Invalid or Expired Invitation
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  {(error as any)?.response?.data?.message ||
                    "This invitation link is invalid or has expired. Please contact your administrator for a new invitation."}
                </p>
              </div>
              <div className="flex gap-3 mt-4">
                <Link href="/">
                  <Button variant="outline">Go to Homepage</Button>
                </Link>
                <Link href="/login">
                  <Button>Go to Login</Button>
                </Link>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
