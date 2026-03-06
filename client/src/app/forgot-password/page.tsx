"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import {
  Anchor,
  Button,
  Container,
  Group,
  Paper,
  Text,
  TextInput,
  Title,
  Box,
} from "@mantine/core";
import { useDocumentTitle } from "@mantine/hooks";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { AuthStatusMessage } from "@/components/auth/AuthStatusMessage";
import classes from "@/app/login/AuthenticationTitle.module.css";

export default function ForgotPasswordPage() {
  useDocumentTitle("Forgot Password | ITMS");

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
    <div className="flex min-h-[100dvh] items-center justify-center px-4">
      <Container size={420} m={0}>
        <Title ta="center" className={classes.title} mt="md">
          Forgot your password?
        </Title>
        <Text className={classes.subtitle} size="sm">
          Industrial Training Management System
        </Text>
        <Paper withBorder p={30} mt={30} radius="md">
          {success ? (
            <div className="space-y-4 text-center">
              <AuthStatusMessage
                type="success"
                message="If an account with that email exists, a password reset link has been sent."
              />
              <Text size="sm" c="dimmed">
                Please check your inbox (and spam folder).
              </Text>
              <Group justify="center">
                <Anchor component={Link} href="/login" size="sm" c="itmsBlue.8">
                  Back to login
                </Anchor>
              </Group>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <TextInput
                label="Email address"
                placeholder="you@institution.edu"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.currentTarget.value)}
                required
                disabled={loading}
              />
              <Box mt="lg">
                <Button fullWidth size="md" type="submit" loading={loading} color="itmsBlue">
                  Send reset link
                </Button>
              </Box>
              <Group justify="center" mt="md">
                <Anchor component={Link} href="/login" size="sm" c="itmsBlue.8">
                  Back to login
                </Anchor>
              </Group>
            </form>
          )}
        </Paper>
      </Container>
    </div>
  );
}
