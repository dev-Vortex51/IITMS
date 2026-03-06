import type { ReactNode } from "react";

export function InvitePageShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center p-4 md:p-6">
        <div className="w-full max-w-3xl">{children}</div>
      </div>
    </div>
  );
}
