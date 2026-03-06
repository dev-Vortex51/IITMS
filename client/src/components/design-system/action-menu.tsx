import type { ReactNode } from "react";
import Link from "next/link";
import { MoreHorizontal } from "lucide-react";
import { ActionIcon, Menu } from "@mantine/core";
import { cn } from "@/lib/utils";

interface ActionItem {
  label: string;
  onClick?: () => void;
  href?: string;
  destructive?: boolean;
  icon?: ReactNode;
  disabled?: boolean;
}

interface ActionMenuProps {
  label?: string;
  items: ActionItem[];
  className?: string;
}

export function ActionMenu({ label = "Actions", items, className }: ActionMenuProps) {
  return (
    <Menu position="bottom-end" shadow="md" withinPortal>
      <Menu.Target>
        <ActionIcon
          variant="subtle"
          size="sm"
          aria-label={label}
          className={cn("text-muted-foreground", className)}
        >
          <MoreHorizontal className="h-4 w-4" />
        </ActionIcon>
      </Menu.Target>

      <Menu.Dropdown className="min-w-44 border-border bg-card">
        {items.map((item) => {
          if (item.href && !item.disabled) {
            return (
              <Menu.Item
                key={item.label}
                component={Link}
                href={item.href}
                leftSection={item.icon}
                disabled={item.disabled}
                className={cn(
                  "text-sm hover:bg-accent",
                  item.destructive ? "text-destructive" : "text-foreground",
                )}
              >
                {item.label}
              </Menu.Item>
            );
          }

          return (
            <Menu.Item
              key={item.label}
              onClick={item.onClick}
              disabled={item.disabled}
              leftSection={item.icon}
              className={cn(
                "text-sm hover:bg-accent",
                item.destructive ? "text-destructive" : "text-foreground",
              )}
            >
              {item.label}
            </Menu.Item>
          );
        })}
      </Menu.Dropdown>
    </Menu>
  );
}
