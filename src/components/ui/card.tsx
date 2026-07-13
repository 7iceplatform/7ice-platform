import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils/cn";

type CardProperties = HTMLAttributes<HTMLDivElement>;

export function Card({ className, ...properties }: CardProperties) {
  return (
    <div
      className={cn("rounded-card border-border-subtle bg-brand-white border", className)}
      {...properties}
    />
  );
}
