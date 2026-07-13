import { cn } from "@/lib/utils/cn";

import type { MainProps } from "./Main.types";

export function Main({
  className,
  children,
  ...props
}: Readonly<MainProps>) {
  return (
    <main
      className={cn("min-h-screen", className)}
      {...props}
    >
      {children}
    </main>
  );
}