import type { HTMLAttributes } from "react";

export type GridColumns = 1 | 2 | 3 | 4;
export type GridGap = "sm" | "md" | "lg";

export interface GridProps extends HTMLAttributes<HTMLDivElement> {
  columns?: GridColumns;
  gap?: GridGap;
}