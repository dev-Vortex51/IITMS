import type { ReactNode } from "react";
import { EmptyState } from "@/components/design-system/empty-state";

interface TableEmptyStateProps {
  title: string;
  description: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export function TableEmptyState({ title, description, icon, action }: TableEmptyStateProps) {
  return (
    <div className="p-6 md:p-10">
      <EmptyState title={title} description={description} icon={icon} />
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  );
}
