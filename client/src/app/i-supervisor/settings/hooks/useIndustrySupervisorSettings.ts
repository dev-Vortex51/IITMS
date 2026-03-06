import { useState, type FormEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import { authService } from "@/services/auth.service";

export function useIndustrySupervisorSettings() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const changePasswordMutation = useMutation({
    mutationFn: (data: { oldPassword: string; newPassword: string }) =>
      authService.changePassword(data.oldPassword, data.newPassword),
    onSuccess: () => {
      setSuccess("Password changed successfully");
      setError("");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setSuccess(""), 5000);
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || "Failed to change password");
      setSuccess("");
    },
  });

  const handlePasswordChange = (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("All fields are required");
      return;
    }

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    changePasswordMutation.mutate({
      oldPassword: currentPassword,
      newPassword,
    });
  };

  return {
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    error,
    success,
    isChangingPassword: changePasswordMutation.isPending,
    handlePasswordChange,
  };
}
