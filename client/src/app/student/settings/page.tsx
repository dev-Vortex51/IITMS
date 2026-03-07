"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/components/providers/auth-provider";
import { LoadingPage, PageHeader } from "@/components/design-system";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authService } from "@/services/auth.service";
import { NotificationPreferencesCard } from "./components/NotificationPreferencesCard";
import { ProfileSettingsCard } from "./components/ProfileSettingsCard";
import { SecuritySettingsCard } from "./components/SecuritySettingsCard";

export default function StudentSettingsPage() {
  useEffect(() => {
    document.title = "Settings | ITMS";
  }, []);

  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [securityDialogOpen, setSecurityDialogOpen] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    checkInReminders: true,
    logbookReminders: true,
  });

  const changePasswordMutation = useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      authService.changePassword(data.currentPassword, data.newPassword),
    onSuccess: () => {
      setSuccess("Password changed successfully");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setError("");
      setSecurityDialogOpen(false);
      setTimeout(() => setSuccess(""), 5000);
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || "Failed to change password");
      setSuccess("");
    },
  });

  const handlePasswordChange = (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setSuccess("");

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

  if (authLoading) {
    return <LoadingPage label="Loading settings..." />;
  }

  if (!user) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-destructive">Unable to load user profile. Please refresh the page.</p>
      </div>
    );
  }

  const fullName =
    user.firstName && user.lastName
      ? `${user.firstName} ${user.lastName}`
      : user.name || "N/A";
  const initials =
    `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase() ||
    "ST";
  const accountCreated = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString()
    : "N/A";
  const matricNumber = user.profileData?.matricNumber || "N/A";
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
        description="Manage your profile, login security, and student preferences."
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
              role={user.role || "Student"}
              email={user.email || "N/A"}
              matricNumber={matricNumber}
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
            <NotificationPreferencesCard
              notificationSettings={notificationSettings}
              onToggle={(key, value) =>
                setNotificationSettings((prev) => ({
                  ...prev,
                  [key]: value,
                }))
              }
            />
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}
