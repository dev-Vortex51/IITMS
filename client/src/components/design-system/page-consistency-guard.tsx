import type { ReactNode } from "react";
import { ContentContainer } from "./app-shell-frame";

interface PageConsistencyGuardProps {
  header: ReactNode;
  children: ReactNode;
}

export function PageConsistencyGuard({
  header,
  children,
}: PageConsistencyGuardProps) {
  return (
    <ContentContainer>
      {header}
      {children}
    </ContentContainer>
  );
}
