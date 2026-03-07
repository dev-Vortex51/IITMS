import type { Metadata } from "next";
import { Rubik } from "next/font/google";
import "@/styles/globals.css";

import "@mantine/core/styles.css";

import {
  ColorSchemeScript,
  MantineProvider,
} from "@mantine/core";

import { QueryProvider } from "@/components/providers/query-provider";
import { WebVitalsReporter } from "@/components/providers/web-vitals-reporter";
import { PwaRegister } from "@/components/providers/pwa-register";
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
  manifest: "/manifest.webmanifest",
  themeColor: "#4f62c7",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ITMS",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.svg", type: "image/svg+xml", sizes: "192x192" },
      { url: "/icons/icon-512.svg", type: "image/svg+xml", sizes: "512x512" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.svg", type: "image/svg+xml" }],
  },
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
              <WebVitalsReporter />
              <PwaRegister />
              <AuthProvider>{children}</AuthProvider>
            </QueryProvider>
            <Toaster position="top-right" richColors />
          </MantineProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
