import type { ReactNode } from "react";
import { SectionCard } from "./section-card";

interface FormSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  actions?: ReactNode;
}

export function FormSection({
  title,
  description,
  children,
  actions,
}: FormSectionProps) {
  return (
    <SectionCard title={title} description={description} actions={actions}>
      <div className="space-y-4">{children}</div>
    </SectionCard>
  );
}
