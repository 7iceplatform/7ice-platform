import { cn } from "@/lib/utils/cn";

import type { SectionProps, SectionSpacing } from "./Section.types";

const spacingClasses: Record<SectionSpacing, string> = {
  none: "",
  sm: "py-8",
  md: "py-12",
  lg: "py-20",
  xl: "py-32",
};

export function Section({
  spacing = "lg",
  className,
  children,
  ...props
}: Readonly<SectionProps>) {
  return (
    <section
      className={cn(spacingClasses[spacing], className)}
      {...props}
    >
      {children}
    </section>
  );
}