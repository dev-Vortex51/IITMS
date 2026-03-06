"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { KeyRound } from "lucide-react";
import { toast } from "sonner";
import { authService } from "@/services/auth.service";
import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { AuthStatusMessage } from "@/components/auth/AuthStatusMessage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"first-login" | "token-reset">("first-login");
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const urlToken = searchParams.get("token");
    if (urlToken) {
      setMode("token-reset");
      setToken(urlToken);
    } else {
      setMode("first-login");
      setToken(null);
    }
  }, [searchParams]);

  const resetMutation = useMutation({
    mutationFn: async (nextPassword: string) => {
      if (mode === "token-reset") {
        if (!token) throw new Error("Missing reset token");
        return authService.resetPasswordWithToken(token, nextPassword);
      }
      return authService.resetPasswordFirstLogin(nextPassword);
    },
    onSuccess: () => {
      toast.success("Password reset successfully! Redirecting to login...");
      setTimeout(() => {
        router.push("/login?message=password-changed");
      }, 1000);
    },
    onError: (err: any) => {
      const errorMessage = err.response?.data?.message || err.message || "Failed to reset password";
      setError(errorMessage);
      toast.error(errorMessage);
    },
  });

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setError("");

    if (password.length < 8) {
      const message = "Password must be at least 8 characters long";
      setError(message);
      toast.error(message);
      return;
    }

    if (password !== confirmPassword) {
      const message = "Passwords do not match";
      setError(message);
      toast.error(message);
      return;
    }

    resetMutation.mutate(password);
  };

  return (
    <AuthPageShell>
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center">
            <div className="rounded-full bg-accent p-4 text-primary">
              <KeyRound className="h-12 w-12" />
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
            <CardDescription className="mt-2">
              {mode === "token-reset"
                ? "Enter a new password for your account."
                : "Create a new secure password for your account (first login)."}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                disabled={resetMutation.isPending}
              />
              <p className="text-xs text-muted-foreground">Must be at least 8 characters long</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
                disabled={resetMutation.isPending}
              />
            </div>

            <AuthStatusMessage type="error" message={error} />

            <Button type="submit" className="w-full" disabled={resetMutation.isPending}>
              {resetMutation.isPending
                ? "Resetting..."
                : mode === "token-reset"
                  ? "Reset Password"
                  : "Set New Password"}
            </Button>

            {mode === "token-reset" && !token ? (
              <AuthStatusMessage type="error" message="Missing or invalid reset token." />
            ) : null}
          </form>
        </CardContent>
      </Card>
    </AuthPageShell>
  );
}
