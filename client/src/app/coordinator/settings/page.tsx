"use client";

import { useEffect } from "react";
import { ProfileCard } from "./components/ProfileCard";
import { SecurityCard } from "./components/SecurityCard";
import { SystemPreferencesCard } from "./components/SystemPreferencesCard";

export default function CoordinatorSettingsPage() {
  useEffect(() => {
    document.title = "Settings | ITMS";
  }, []);

  return (
    <div className="space-y-8 max-w-[1200px] mx-auto pb-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Account Settings
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your profile, security preferences, and system workflow.
        </p>
      </div>

      {/* Grid Layout for Settings Sections */}
      <div className="grid gap-8">
        <ProfileCard />
        <SecurityCard />
        <SystemPreferencesCard />
      </div>
    </div>
  );
}
