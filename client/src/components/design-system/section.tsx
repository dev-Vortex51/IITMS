import { ReactNode } from "react";
import { SectionCard } from "./section-card";

interface SectionProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}

export function Section({ title, description, actions, children }: SectionProps) {
  return (
    <SectionCard title={title} description={description} actions={actions}>
      {children}
    </SectionCard>
  );
}
