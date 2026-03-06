import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AppShellFrameProps {
  sidebar: ReactNode;
  topBar: ReactNode;
  children: ReactNode;
  className?: string;
}

export function AppShellFrame({
  sidebar,
  topBar,
  children,
  className,
}: AppShellFrameProps) {
  return (
    <div className={cn("min-h-screen bg-background text-foreground", className)}>
      <div className="flex min-h-screen">
        <aside className="hidden w-66 shrink-0 border-r bg-card md:block">{sidebar}</aside>
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="h-16 border-b bg-background/95 backdrop-blur">{topBar}</header>
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </div>
  );
}

interface AppTopBarProps {
  left?: ReactNode;
  right?: ReactNode;
  className?: string;
}

export function AppTopBar({ left, right, className }: AppTopBarProps) {
  return (
    <div className={cn("mx-auto flex h-full max-w-7xl items-center justify-between px-4 md:px-6", className)}>
      <div className="min-w-0">{left}</div>
      <div className="flex items-center gap-2">{right}</div>
    </div>
  );
}

interface AppSidebarNavProps {
  brand?: ReactNode;
  nav: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export function AppSidebarNav({ brand, nav, footer, className }: AppSidebarNavProps) {
  return (
    <div className={cn("flex h-screen flex-col", className)}>
      <div className="border-b px-4 py-4">{brand}</div>
      <div className="flex-1 overflow-y-auto px-3 py-4">{nav}</div>
      {footer ? <div className="border-t px-4 py-4">{footer}</div> : null}
    </div>
  );
}

interface ContentContainerProps {
  children: ReactNode;
  className?: string;
}

export function ContentContainer({ children, className }: ContentContainerProps) {
  return <div className={cn("mx-auto w-full max-w-7xl space-y-6 px-4 py-4 md:px-6 md:py-6", className)}>{children}</div>;
}
