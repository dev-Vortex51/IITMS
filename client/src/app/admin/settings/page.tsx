"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/components/providers/auth-provider";
import { authService } from "@/services/auth.service";
import { settingsService } from "@/services/settings.service";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { User, Lock, Mail, Shield, Bell, Database } from "lucide-react";
import { toast } from "sonner";

export default function AdminSettingsPage() {
  const { user, isLoading } = useAuth();
  console.log("Settings page - user:", user, "isLoading:", isLoading);
  const queryClient = useQueryClient();
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");

  // Fetch System Settings
  const { data: systemSettings } = useQuery({
    queryKey: ["systemSettings"],
    queryFn: settingsService.getSystemSettings,
    enabled: user?.role === "admin",
  });

  const [systemSettingsForm, setSystemSettingsForm] = useState({
    currentSession: "2024/2025",
    semester: "First Semester",
    siweDuration: 6,
    minWeeks: 24,
    autoAssignSupervisors: false,
    requireLogbookApproval: true,
  });

  // Fetch Notification Preferences
  const { data: notificationPreferences } = useQuery({
    queryKey: ["notificationPreferences"],
    queryFn: settingsService.getNotificationPreferences,
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: false,
    placementAlerts: false,
    systemUpdates: false,
  });

  // Update local state when data is fetched
  useEffect(() => {
    if (systemSettings) {
      setSystemSettingsForm({
        currentSession: systemSettings.currentSession,
        semester: systemSettings.semester,
        siweDuration: systemSettings.siweDuration,
        minWeeks: systemSettings.minWeeks,
        autoAssignSupervisors: systemSettings.autoAssignSupervisors,
        requireLogbookApproval: systemSettings.requireLogbookApproval,
      });
    }
  }, [systemSettings]);

  useEffect(() => {
    if (notificationPreferences) {
      setNotificationSettings({
        emailNotifications: notificationPreferences.emailNotifications,
        placementAlerts: notificationPreferences.placementAlerts,
        systemUpdates: notificationPreferences.systemUpdates,
      });
    }
  }, [notificationPreferences]);

  const changePasswordMutation = useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      authService.changePassword(data.currentPassword, data.newPassword),
    onSuccess: () => {
      toast.success("Password changed successfully");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setError("");
    },
    onError: (err: any) => {
      const errorMessage =
        err.response?.data?.message || "Failed to change password";
      setError(errorMessage);
      toast.error(errorMessage);
    },
  });

  // System Settings Mutation
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

  // Notification Preferences Mutation
  const updateNotificationsMutation = useMutation({
    mutationFn: settingsService.updateNotificationPreferences,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notificationPreferences"] });
      toast.success("Notification preferences updated");
    },
    onError: (err: any) => {
      toast.error(
        err.response?.data?.message || "Failed to update preferences"
      );
    },
  });

  // Save System Settings
  const saveSystemSettings = () => {
    updateSystemSettingsMutation.mutate(systemSettingsForm);
  };

  // Toggle Notification Settings
  const toggleNotification = (key: keyof typeof notificationSettings) => {
    const newValue = !notificationSettings[key];
    setNotificationSettings((prev) => ({
      ...prev,
      [key]: newValue,
    }));

    // Update on backend
    updateNotificationsMutation.mutate({
      [key]: newValue,
    });
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
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

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading settings...</p>
      </div>
    );
  }

  // Show error if user not loaded
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-destructive">
          Unable to load user profile. Please refresh the page.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage system settings and preferences
        </p>
      </div>

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Your account details</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label className="text-muted-foreground">Name</Label>
              <p className="font-medium">
                {user?.firstName && user?.lastName
                  ? `${user.firstName} ${user.lastName}`
                  : "N/A"}
              </p>
            </div>
            <div>
              <Label className="text-muted-foreground">Email</Label>
              <p className="font-medium flex items-center gap-2">
                <Mail className="h-4 w-4" />
                {user?.email || "N/A"}
              </p>
            </div>
            <div>
              <Label className="text-muted-foreground">Role</Label>
              <p className="font-medium flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span className="capitalize">{user?.role || "N/A"}</span>
              </p>
            </div>
            <div>
              <Label className="text-muted-foreground">Account Created</Label>
              <p className="font-medium">
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent/10">
              <Lock className="h-6 w-6 text-accent-foreground" />
            </div>
            <div>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your account password</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    currentPassword: e.target.value,
                  })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    newPassword: e.target.value,
                  })
                }
                required
                minLength={8}
              />
              <p className="text-sm text-muted-foreground">
                Must be at least 8 characters long
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    confirmPassword: e.target.value,
                  })
                }
                required
              />
            </div>

            {error && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                {error}
              </div>
            )}

            <Button type="submit" disabled={changePasswordMutation.isPending}>
              {changePasswordMutation.isPending
                ? "Changing Password..."
                : "Change Password"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Separator />

      {/* System Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Database className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>Configure system-wide settings</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Academic Session */}
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-1">Academic Session</h3>
              <p className="text-sm text-muted-foreground">
                Configure the current academic session
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="currentSession">Current Session</Label>
                <Input
                  id="currentSession"
                  value={systemSettingsForm.currentSession}
                  onChange={(e) =>
                    setSystemSettingsForm({
                      ...systemSettingsForm,
                      currentSession: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="semester">Semester</Label>
                <Input
                  id="semester"
                  value={systemSettingsForm.semester}
                  onChange={(e) =>
                    setSystemSettingsForm({
                      ...systemSettingsForm,
                      semester: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* SIWES Duration */}
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-1">SIWES Duration</h3>
              <p className="text-sm text-muted-foreground">
                Set the standard duration for industrial training
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (Months)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={systemSettingsForm.siweDuration}
                  onChange={(e) =>
                    setSystemSettingsForm({
                      ...systemSettingsForm,
                      siweDuration: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="minWeeks">Minimum Weeks</Label>
                <Input
                  id="minWeeks"
                  type="number"
                  value={systemSettingsForm.minWeeks}
                  onChange={(e) =>
                    setSystemSettingsForm({
                      ...systemSettingsForm,
                      minWeeks: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Approval Settings */}
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-1">Approval Settings</h3>
              <p className="text-sm text-muted-foreground">
                Configure placement and logbook approval settings
              </p>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto-assign Supervisors</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically assign supervisors after placement approval
                  </p>
                </div>
                <Switch
                  checked={systemSettingsForm.autoAssignSupervisors}
                  onCheckedChange={(checked: boolean) =>
                    setSystemSettingsForm({
                      ...systemSettingsForm,
                      autoAssignSupervisors: checked,
                    })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Require Logbook Approval</Label>
                  <p className="text-sm text-muted-foreground">
                    Supervisors must approve all logbook entries
                  </p>
                </div>
                <Switch
                  checked={systemSettingsForm.requireLogbookApproval}
                  onCheckedChange={(checked: boolean) =>
                    setSystemSettingsForm({
                      ...systemSettingsForm,
                      requireLogbookApproval: checked,
                    })
                  }
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={saveSystemSettings}>Save System Settings</Button>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent/10">
              <Bell className="h-6 w-6 text-accent-foreground" />
            </div>
            <div>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure system notifications</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive email updates for system events
                </p>
              </div>
              <Switch
                checked={notificationSettings.emailNotifications}
                onCheckedChange={() => toggleNotification("emailNotifications")}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Placement Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when placements need approval
                </p>
              </div>
              <Switch
                checked={notificationSettings.placementAlerts}
                onCheckedChange={() => toggleNotification("placementAlerts")}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>System Updates</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications about system updates
                </p>
              </div>
              <Switch
                checked={notificationSettings.systemUpdates}
                onCheckedChange={() => toggleNotification("systemUpdates")}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
