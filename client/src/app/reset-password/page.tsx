"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import {
  Anchor,
  Box,
  Button,
  Container,
  Group,
  Paper,
  PasswordInput,
  Text,
  Title,
} from "@mantine/core";
import { useDocumentTitle } from "@mantine/hooks";
import { toast } from "sonner";
import { authService } from "@/services/auth.service";
import { AuthStatusMessage } from "@/components/auth/AuthStatusMessage";
import classes from "@/app/login/AuthenticationTitle.module.css";

export default function ResetPasswordPage() {
  useDocumentTitle("Reset Password | ITMS");

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

  const tokenInvalid = mode === "token-reset" && !token;

  return (
    <div className="flex min-h-[100dvh] items-center justify-center px-4">
      <Container size={420} m={0}>
        <Title ta="center" className={classes.title} mt="md">
          Reset Password
        </Title>
        <Text className={classes.subtitle} size="sm">
          Industrial Training Management System
        </Text>
        <Paper withBorder p={30} mt={30} radius="md">
          <Text size="sm" c="dimmed" mb="md">
              {mode === "token-reset"
                ? "Enter a new password for your account."
                : "Create a new secure password for your account (first login)."}
          </Text>
          <form onSubmit={handleSubmit}>
            <PasswordInput
              label="New password"
                placeholder="••••••••"
                value={password}
                onChange={(event) => setPassword(event.currentTarget.value)}
                required
              disabled={resetMutation.isPending || tokenInvalid}
            />
            <Text size="xs" c="dimmed" mt="xs">
              Must be at least 8 characters long.
            </Text>
            <PasswordInput
              label="Confirm password"
                placeholder="••••••••"
              mt="md"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.currentTarget.value)}
                required
              disabled={resetMutation.isPending || tokenInvalid}
            />

            <Box mt="md">
              <AuthStatusMessage type="error" message={error} />
            </Box>
            {tokenInvalid ? (
              <Box mt="md">
                <AuthStatusMessage type="error" message="Missing or invalid reset token." />
              </Box>
            ) : null}
            <Box mt="lg">
              <Button
                fullWidth
                size="md"
                type="submit"
                loading={resetMutation.isPending}
                color="itmsBlue"
                disabled={tokenInvalid}
              >
              {resetMutation.isPending
                ? "Resetting..."
                : mode === "token-reset"
                  ? "Reset Password"
                  : "Set New Password"}
              </Button>
            </Box>
            <Group justify="center" mt="md">
              <Anchor component={Link} href="/login" size="sm" c="itmsBlue.8">
                Back to login
              </Anchor>
            </Group>
          </form>
        </Paper>
      </Container>
    </div>
  );
}
