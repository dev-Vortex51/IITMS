import type { ReactNode } from "react";

interface AuthPageShellProps {
  children: ReactNode;
  tone?: "primary" | "indigo";
}

export function AuthPageShell({
  children,
  tone = "primary",
}: AuthPageShellProps) {
  const gradientClass =
    tone === "indigo"
      ? "from-blue-50 to-indigo-100"
      : "from-primary to-primary/80";

  return (
    <div className={`flex min-h-screen items-center justify-center bg-gradient-to-br ${gradientClass} p-4`}>
      {children}
    </div>
  );
}
