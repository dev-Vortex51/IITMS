import { useEffect, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { authService } from "@/services/auth.service";
import { settingsService } from "@/services/settings.service";

export function useAdminSettings(isAdmin: boolean) {
  const queryClient = useQueryClient();

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");

  const [systemSettingsForm, setSystemSettingsForm] = useState({
    currentSession: "2024/2025",
    semester: "First Semester",
    siweDuration: 6,
    minWeeks: 24,
    autoAssignSupervisors: false,
    requireLogbookApproval: true,
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: false,
    placementAlerts: false,
    systemUpdates: false,
  });

  const systemSettingsQuery = useQuery({
    queryKey: ["systemSettings"],
    queryFn: settingsService.getSystemSettings,
    enabled: isAdmin,
  });

  const notificationPreferencesQuery = useQuery({
    queryKey: ["notificationPreferences"],
    queryFn: settingsService.getNotificationPreferences,
  });

  useEffect(() => {
    if (!systemSettingsQuery.data) return;

    setSystemSettingsForm({
      currentSession: systemSettingsQuery.data.currentSession,
      semester: systemSettingsQuery.data.semester,
      siweDuration: systemSettingsQuery.data.siweDuration,
      minWeeks: systemSettingsQuery.data.minWeeks,
      autoAssignSupervisors: systemSettingsQuery.data.autoAssignSupervisors,
      requireLogbookApproval: systemSettingsQuery.data.requireLogbookApproval,
    });
  }, [systemSettingsQuery.data]);

  useEffect(() => {
    if (!notificationPreferencesQuery.data) return;

    setNotificationSettings({
      emailNotifications: notificationPreferencesQuery.data.emailNotifications,
      placementAlerts: notificationPreferencesQuery.data.placementAlerts,
      systemUpdates: notificationPreferencesQuery.data.systemUpdates,
    });
  }, [notificationPreferencesQuery.data]);

  const changePasswordMutation = useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      authService.changePassword(data.currentPassword, data.newPassword),
    onSuccess: () => {
      toast.success("Password changed successfully");
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setError("");
    },
    onError: (err: any) => {
      const errorMessage = err.response?.data?.message || "Failed to change password";
      setError(errorMessage);
      toast.error(errorMessage);
    },
  });

  const updateSystemSettingsMutation = useMutation({
    mutationFn: settingsService.updateSystemSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["systemSettings"] });
      toast.success("System settings saved successfully");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to save settings");
    },
  });

  const updateNotificationsMutation = useMutation({
    mutationFn: settingsService.updateNotificationPreferences,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notificationPreferences"] });
      toast.success("Notification preferences updated");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to update preferences");
    },
  });

  const saveSystemSettings = () => {
    updateSystemSettingsMutation.mutate(systemSettingsForm);
  };

  const toggleNotification = (key: keyof typeof notificationSettings) => {
    const nextValue = !notificationSettings[key];
    setNotificationSettings((prev) => ({ ...prev, [key]: nextValue }));
    updateNotificationsMutation.mutate({ [key]: nextValue });
  };

  const handlePasswordChange = (event: FormEvent) => {
    event.preventDefault();
    setError("");

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    changePasswordMutation.mutate({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
    });
  };

  return {
    passwordData,
    setPasswordData,
    error,
    systemSettingsForm,
    setSystemSettingsForm,
    notificationSettings,
    saveSystemSettings,
    toggleNotification,
    handlePasswordChange,
    isChangingPassword: changePasswordMutation.isPending,
  };
}
