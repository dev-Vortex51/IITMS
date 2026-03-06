"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { AuthStatusMessage } from "@/components/auth/AuthStatusMessage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      await apiClient.post("/auth/forgot-password", { email });
      setSuccess(true);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to send reset email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthPageShell>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Forgot Password</CardTitle>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="space-y-4 text-center">
              <AuthStatusMessage
                type="success"
                message="If an account with that email exists, a password reset link has been sent."
              />
              <p className="text-sm text-muted-foreground">Please check your inbox (and spam folder).</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@institution.edu"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Sending..." : "Send Reset Link"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </AuthPageShell>
  );
}
