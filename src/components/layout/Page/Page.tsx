import { cn } from "@/lib/utils/cn";

import type { PageProps } from "./Page.types";

export function Page({
  className,
  children,
  ...props
}: Readonly<PageProps>) {
  return (
    <div
      className={cn(
        "relative flex min-h-screen flex-col bg-background text-foreground",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}