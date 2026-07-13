"use client";

import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";

interface SessionProviderWrapperProperties {
  children: ReactNode;
}

export function SessionProviderWrapper({ children }: Readonly<SessionProviderWrapperProperties>) {
  return <SessionProvider>{children}</SessionProvider>;
}
