import type { Metadata } from "next";
import type { ReactNode } from "react";

import "./globals.css";

import { AppProviders } from "@/providers/app-providers";

const isProduction = process.env.NODE_ENV === "production";

export const metadata: Metadata = {
  title: {
    default: "7ice",
    template: "%s | 7ice",
  },
  robots: {
    index: isProduction,
    follow: isProduction,
  },
};

interface RootLayoutProperties {
  children: ReactNode;
}

export default function RootLayout({ children }: Readonly<RootLayoutProperties>) {
  return (
    <html lang="ru">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
