import { cn } from "@/lib/utils/cn";

import type { StackGap, StackProps } from "./Stack.types";

const gapClasses: Record<StackGap, string> = {
  xs: "gap-2",
  sm: "gap-4",
  md: "gap-6",
  lg: "gap-8",
  xl: "gap-12",
};

export function Stack({
  gap = "md",
  className,
  children,
  ...props
}: Readonly<StackProps>) {
  return (
    <div
      className={cn("flex flex-col", gapClasses[gap], className)}
      {...props}
    >
      {children}
    </div>
  );
}