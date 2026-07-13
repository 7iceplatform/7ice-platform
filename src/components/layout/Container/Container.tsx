import { cn } from "@/lib/utils/cn";

import type { ContainerProps, ContainerSize } from "./Container.types";

const sizeClasses: Record<ContainerSize, string> = {
  default: "mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8",
  wide: "mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8",
  full: "w-full px-4 sm:px-6 lg:px-8",
};

export function Container({
  size = "default",
  className,
  children,
  ...props
}: Readonly<ContainerProps>) {
  return (
    <div
      className={cn(sizeClasses[size], className)}
      {...props}
    >
      {children}
    </div>
  );
}