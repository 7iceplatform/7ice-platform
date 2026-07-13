import type { HTMLAttributes } from "react";

export type SectionSpacing = "none" | "sm" | "md" | "lg" | "xl";

export interface SectionProps extends HTMLAttributes<HTMLElement> {
  spacing?: SectionSpacing;
}