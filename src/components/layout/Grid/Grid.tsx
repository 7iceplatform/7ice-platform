import { cn } from "@/lib/utils/cn";

import type { GridColumns, GridGap, GridProps } from "./Grid.types";

const columnClasses: Record<GridColumns, string> = {
  1: "grid-cols-1",
  2: "grid-cols-1 md:grid-cols-2",
  3: "grid-cols-1 md:grid-cols-2 xl:grid-cols-3",
  4: "grid-cols-1 md:grid-cols-2 xl:grid-cols-4",
};

const gapClasses: Record<GridGap, string> = {
  sm: "gap-4",
  md: "gap-6",
  lg: "gap-8",
};

export function Grid({
  columns = 1,
  gap = "md",
  className,
  children,
  ...props
}: Readonly<GridProps>) {
  return (
    <div
      className={cn(
        "grid w-full",
        columnClasses[columns],
        gapClasses[gap],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}