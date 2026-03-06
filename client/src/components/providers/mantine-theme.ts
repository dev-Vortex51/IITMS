import { createTheme, MantineColorsTuple } from "@mantine/core";

const itmsPrimary: MantineColorsTuple = [
  "#E6F0FF",
  "#B3D1FF",
  "#80B2FF",
  "#4D93FF",
  "#1A74FF",
  "#0059E6",
  "#0046B3",
  "#003280",
  "#001F4D",
  "#000D21",
];

const itmsSecondary: MantineColorsTuple = [
  "#F1F5F9",
  "#E2E8F0",
  "#CBD5E1",
  "#94A3B8",
  "#64748B",
  "#475569",
  "#334155",
  "#1E293B",
  "#0F172A",
  "#020617",
];
const itmsAccent: MantineColorsTuple = [
  "#FFF8E6",
  "#FFEFCC",
  "#FFE5B3",
  "#FFDB99",
  "#FFD180",
  "#FFC766",
  "#FFCB70",
  "#FFA800",
  "#E69700",
  "#B37500",
];

export const theme = createTheme({
  colors: {
    itmsBlue: itmsPrimary,
    itmsSecondary: itmsSecondary,
    itmsAccent: itmsAccent,
  },
  primaryColor: "itmsBlue",
  primaryShade: 8,
});
