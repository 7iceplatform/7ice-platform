import Link from "next/link";
import type { Route } from "next";

import type { NavigationProps } from "./Navigation.types";

export function Navigation({ items }: Readonly<NavigationProps>) {
  return (
    <nav aria-label="Main navigation">
      <ul className="flex items-center gap-8">
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href as Route}
              className="text-sm font-medium transition-colors duration-200 hover:text-primary"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}