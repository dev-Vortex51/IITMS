"use client";

import { ActionIcon, TextInput, TextInputProps, useMantineTheme } from "@mantine/core";
import { ArrowRight, Search } from "lucide-react";

export function HeaderSearchInput(props: TextInputProps) {
  const theme = useMantineTheme();

  return (
    <TextInput
      radius="xl"
      size="md"
      placeholder="Search..."
      rightSectionWidth={42}
      leftSection={<Search size={18} strokeWidth={1.5} />}
      rightSection={
        <ActionIcon
          size={32}
          radius="xl"
          color={theme.primaryColor}
          variant="filled"
          aria-label="Search"
        >
          <ArrowRight size={18} strokeWidth={1.5} />
        </ActionIcon>
      }
      aria-label="Search"
      {...props}
    />
  );
}
