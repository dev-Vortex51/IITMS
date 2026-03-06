"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/components/providers/auth-provider";
import { SettingsLoadingState } from "./components/SettingsLoadingState";
import { SettingsHeader } from "./components/SettingsHeader";
import { ProfileInfoCard } from "./components/ProfileInfoCard";
import { ChangePasswordCard } from "./components/ChangePasswordCard";
import { SystemSettingsCard } from "./components/SystemSettingsCard";
import { NotificationSettingsCard } from "./components/NotificationSettingsCard";
import { useAdminSettings } from "./hooks/useAdminSettings";

export default function AdminSettingsPage() {
  const { user, isLoading } = useAuth();
  const {
    passwordData,
    setPasswordData,
    error,
    systemSettingsForm,
    setSystemSettingsForm,
    notificationSettings,
    saveSystemSettings,
    toggleNotification,
    handlePasswordChange,
    isChangingPassword,
  } = useAdminSettings(user?.role === "admin");

  if (isLoading) {
    return <SettingsLoadingState />;
  }

  if (!user) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-destructive">Unable to load user profile. Please refresh the page.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-4 md:space-y-5">
      <SettingsHeader />

      <section className="rounded-lg border border-border bg-card p-3 shadow-sm md:p-4">
        <Tabs defaultValue="profile" className="w-full">
          <div className="overflow-x-auto pb-2">
            <TabsList className="h-auto min-w-max bg-muted/70 p-1">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
              <TabsTrigger value="system">System</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="profile" className="mt-3">
            <ProfileInfoCard user={user} />
          </TabsContent>

          <TabsContent value="security" className="mt-3">
            <ChangePasswordCard
              passwordData={passwordData}
              onPasswordDataChange={setPasswordData}
              error={error}
              isChangingPassword={isChangingPassword}
              onSubmit={handlePasswordChange}
            />
          </TabsContent>

          <TabsContent value="preferences" className="mt-3">
            <NotificationSettingsCard
              notificationSettings={notificationSettings}
              onToggle={toggleNotification}
            />
          </TabsContent>

          <TabsContent value="system" className="mt-3">
            <SystemSettingsCard
              systemSettingsForm={systemSettingsForm}
              onSystemSettingsChange={setSystemSettingsForm}
              onSave={saveSystemSettings}
            />
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}
