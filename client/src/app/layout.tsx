import type { Metadata } from "next";
import { Rubik } from "next/font/google";
import "@/styles/globals.css";

import "@mantine/core/styles.css";

import {
  ColorSchemeScript,
  MantineProvider,
  createTheme,
  MantineColorsTuple,
} from "@mantine/core";

import { QueryProvider } from "@/components/providers/query-provider";
import { AuthProvider } from "@/components/providers/auth-provider";
import { ErrorBoundary } from "@/components/error-boundary";
import { Toaster } from "sonner";
import { theme } from "@/components/providers/mantine-theme";

const rubik = Rubik({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "ITMS - Industrial Training Management System",
    template: "%s | ITMS",
  },
  description: "Industrial Training Management System for SIWES/IT Programs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <ColorSchemeScript defaultColorScheme="light" />
      </head>
      <body className={rubik.className}>
        <ErrorBoundary>
          <MantineProvider theme={theme} defaultColorScheme="light">
            <QueryProvider>
              <AuthProvider>{children}</AuthProvider>
            </QueryProvider>
            <Toaster position="top-right" richColors />
          </MantineProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
