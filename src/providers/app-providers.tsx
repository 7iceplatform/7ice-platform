"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useState } from "react";

import { SessionProviderWrapper } from "@/providers/session-provider";

interface AppProvidersProperties {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProperties) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 1,
            staleTime: 30_000,
          },
        },
      }),
  );

  return (
    <SessionProviderWrapper>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </SessionProviderWrapper>
  );
}
