"use client";

import { InviteInvalidCard } from "./components/InviteInvalidCard";
import { InviteLoadingState } from "./components/InviteLoadingState";
import { InvitePageShell } from "./components/InvitePageShell";
import { SetupFormCard } from "./components/SetupFormCard";
import { useSetupAccount } from "./hooks/useSetupAccount";

export default function SetupAccountPage() {
  const {
    token,
    invitation,
    isLoadingInvitation,
    formData,
    setFieldValue,
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    handleSubmit,
    isSubmitting,
    isOnline,
    hasQueuedSetup,
    isSyncingQueuedSetup,
    syncQueuedSetup,
  } = useSetupAccount();

  if (!token) {
    return (
      <InvitePageShell>
        <InviteInvalidCard
          title="Invalid Link"
          message="This invitation link is invalid. Please check your email for the correct link."
        />
      </InvitePageShell>
    );
  }

  if (isLoadingInvitation) {
    return (
      <InvitePageShell>
        <InviteLoadingState />
      </InvitePageShell>
    );
  }

  if (!invitation) {
    return (
      <InvitePageShell>
        <InviteInvalidCard
          title="Invalid or Expired Invitation"
          message="This invitation link is invalid or has expired. Please contact your administrator for a new invitation."
        />
      </InvitePageShell>
    );
  }

  return (
    <InvitePageShell>
      <SetupFormCard
        invitation={invitation}
        formData={formData}
        onFieldChange={setFieldValue}
        showPassword={showPassword}
        onToggleShowPassword={() => setShowPassword((prev) => !prev)}
        showConfirmPassword={showConfirmPassword}
        onToggleShowConfirmPassword={() => setShowConfirmPassword((prev) => !prev)}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        isOnline={isOnline}
        hasQueuedSetup={hasQueuedSetup}
        isSyncingQueuedSetup={isSyncingQueuedSetup}
        onSyncQueuedSetup={syncQueuedSetup}
      />
    </InvitePageShell>
  );
}
