import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "dark"
  | "ghost"
  | "text";

export type ButtonSize =
  | "sm"
  | "md"
  | "lg";

interface ButtonProperties
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  render?: ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-brand-blue text-brand-white hover:opacity-90",

  secondary:
    "border border-border-subtle bg-brand-white text-brand-graphite hover:border-brand-graphite",

  dark:
    "bg-brand-graphite text-brand-white hover:opacity-90",

  ghost:
    "border border-white/15 bg-white/5 text-brand-white hover:bg-white/10",

  text:
    "bg-transparent px-0 text-brand-blue hover:opacity-80",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-10 px-4 text-sm",

  md: "h-12 px-6 text-base",

  lg: "h-14 px-8 text-base",
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  fullWidth = false,
  type = "button",
  render,
  ...properties
}: ButtonProperties) {
  const classes = cn(
    "inline-flex items-center justify-center rounded-control font-semibold transition-all duration-200",
    "disabled:pointer-events-none disabled:opacity-50",
    variantClasses[variant],
    sizeClasses[size],
    fullWidth && "w-full",
    className,
  );

  if (render) {
    return (
      <span className={classes}>
        {render}
      </span>
    );
  }

  return (
    <button
      type={type}
      className={classes}
      {...properties}
    />
  );
}