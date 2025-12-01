"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GraduationCap, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    // Check for success message from URL params
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("message") === "password-changed") {
      toast.success(
        "Password changed successfully! You can now login with your new password."
      );
      // Clear the URL parameter
      window.history.replaceState({}, "", "/login");
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login({ email, password });
    } catch (err: any) {
      console.error("Login error:", err);
      if (
        err.code === "ERR_NETWORK" ||
        err.message?.includes("Network Error")
      ) {
        setError(
          "Cannot connect to server. Please ensure the backend is running on http://localhost:5000"
        );
      } else {
        const errorMessage =
          err.response?.data?.message ||
          "Login failed. Please check your credentials.";
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Prevent hydration mismatch by not rendering until client-side
  if (!isMounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-primary/80 p-4">
        <div className="w-full max-w-md h-96 bg-white rounded-lg animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-primary/80 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center">
            <div className="bg-accent text-primary rounded-full p-4">
              <GraduationCap className="h-12 w-12" />
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">
              SIWES Management System
            </CardTitle>
            <CardDescription className="mt-2">
              Industrial Training Portal
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@institution.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="flex justify-end">
              <a
                href="/forgot-password"
                className="text-sm text-primary hover:underline"
                tabIndex={0}
              >
                Forgot password?
              </a>
            </div>
            {error && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                {error}
              </div>
            )}
            <Button
              type="submit"
              className="w-full"
              disabled={submitting || isLoading}
            >
              {submitting || isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
          <p className="text-center text-sm text-muted-foreground mt-4">
            First time? You&apos;ll be prompted to reset your password.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
