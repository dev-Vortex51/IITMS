"use client";

import { useEffect, useState, type FormEvent } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { PageHeader } from "@/components/design-system";
import { useAuth } from "@/components/providers/auth-provider";
import { authService } from "@/services/auth.service";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PreferenceSettingsCard } from "./components/PreferenceSettingsCard";
import { ProfileSettingsCard } from "./components/ProfileSettingsCard";
import { SecuritySettingsCard } from "./components/SecuritySettingsCard";

export default function DSupervisorSettingsPage() {
  useEffect(() => {
    document.title = "Settings | ITMS";
  }, []);

  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [securityDialogOpen, setSecurityDialogOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    reviewReminders: true,
    assessmentUpdates: true,
  });

  const changePasswordMutation = useMutation({
    mutationFn: (data: { oldPassword: string; newPassword: string }) =>
      authService.changePassword(data.oldPassword, data.newPassword),
    onSuccess: () => {
      setSuccess("Password changed successfully");
      setError("");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setSecurityDialogOpen(false);
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

    if (passwordData.newPassword.length < 8) {
      setError("New password must be at least 8 characters long");
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    changePasswordMutation.mutate({
      oldPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
    });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-muted-foreground">Loading settings...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-destructive">Unable to load user profile. Please refresh the page.</p>
      </div>
    );
  }

  const fullName =
    user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.name || "N/A";
  const initials =
    `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase() || "AS";
  const accountCreated = user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A";
  const requestedTab = searchParams.get("tab");
  const activeTab =
    requestedTab === "security" || requestedTab === "preferences"
      ? requestedTab
      : "profile";

  const handleTabChange = (nextTab: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", nextTab);
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  return (
    <div className="mx-auto w-full max-w-6xl space-y-4 md:space-y-5">
      <PageHeader
        title="Settings"
        description="Manage your profile, security, and academic supervisor preferences."
      />

      <section className="rounded-lg border border-border bg-card p-3 shadow-sm md:p-4">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <div className="overflow-x-auto pb-2">
            <TabsList className="h-auto min-w-max bg-muted/70 p-1">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="profile" className="mt-3">
            <ProfileSettingsCard
              fullName={fullName}
              initials={initials}
              email={user.email || "N/A"}
              accountCreated={accountCreated}
            />
          </TabsContent>

          <TabsContent value="security" className="mt-3">
            <SecuritySettingsCard
              open={securityDialogOpen}
              onOpenChange={setSecurityDialogOpen}
              passwordData={passwordData}
              onPasswordDataChange={setPasswordData}
              error={error}
              success={success}
              isPending={changePasswordMutation.isPending}
              onSubmit={handlePasswordChange}
            />
          </TabsContent>

          <TabsContent value="preferences" className="mt-3">
            <PreferenceSettingsCard
              settings={notificationSettings}
              onToggle={(key, checked) =>
                setNotificationSettings((prev) => ({
                  ...prev,
                  [key]: checked,
                }))
              }
            />
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}
