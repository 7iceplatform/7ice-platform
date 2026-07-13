import type { InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils/cn";

interface TextInputProperties extends InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
}

export function TextInput({ className, hasError = false, ...properties }: TextInputProperties) {
  return (
    <input
      aria-invalid={hasError || undefined}
      className={cn(
        "rounded-control bg-brand-white text-brand-graphite placeholder:text-brand-graphite/50 focus:border-brand-blue h-10 w-full border px-3 text-sm outline-none",
        hasError ? "border-brand-graphite" : "border-border-subtle",
        className,
      )}
      {...properties}
    />
  );
}
