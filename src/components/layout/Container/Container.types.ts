import type { HTMLAttributes } from "react";

export type ContainerSize = "default" | "wide" | "full";

export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  size?: ContainerSize;
}