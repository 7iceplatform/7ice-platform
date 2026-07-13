"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils/cn";

import type { DesktopNavigationProps } from "./DesktopNavigation.types";

export function DesktopNavigation({
  items,
}: Readonly<DesktopNavigationProps>) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Основная навигация"
      className="hidden lg:block"
    >
      <ul className="flex items-center gap-10">
        {items.map((item) => {
          const active = pathname === item.href;

          return (
            <li key={item.href}>
              <Link
                href={item.href as Route}
                className={cn(
                  "relative text-[15px] font-medium transition-colors duration-200",
                  active
                    ? "text-primary"
                    : "text-foreground hover:text-primary",
                )}
              >
                {item.label}

                <span
                  className={cn(
                    "absolute -bottom-2 left-0 h-0.5 w-full rounded-full bg-primary transition-opacity duration-200",
                    active ? "opacity-100" : "opacity-0",
                  )}
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}