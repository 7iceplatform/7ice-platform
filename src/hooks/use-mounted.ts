"use client";

import { useSyncExternalStore } from "react";

function subscribe() {
  return () => undefined;
}

export function useMounted(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
