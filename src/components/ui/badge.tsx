import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils/cn";

type BadgeTone = "default" | "info" | "inverted" | "success" | "warning";

interface BadgeProperties extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

const toneClasses: Record<BadgeTone, string> = {
  default: "bg-surface-muted text-brand-graphite",
  info: "bg-brand-white text-brand-blue",
  inverted: "bg-brand-graphite text-brand-white",
  success: "bg-emerald-50 text-emerald-700",
  warning: "bg-amber-50 text-amber-700",
};

export function Badge({ className, tone = "default", ...properties }: BadgeProperties) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-1 text-xs leading-none font-medium",
        toneClasses[tone],
        className,
      )}
      {...properties}
    />
  );
}
