"use client";

import { useQuery } from "@tanstack/react-query";

import { Container } from "@/components/layout";
import { cn } from "@/lib/utils/cn";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  familiesCount: number;
}

const icons: Record<string, string> = {
  split: "❄️",
  multi: "❄️",
  vrf: "🏗️",
  ventilation: "💨",
  commercial: "🏢",
  accessories: "🔧",
};

export function CatalogCategories() {
  const { data } = useQuery<{ data: Category[] }>({
    queryKey: ["public", "catalog", "categories"],
    queryFn: async () => {
      const response = await fetch("/api/v1/public/catalog/categories");
      if (!response.ok) throw new Error("Failed to fetch categories");
      return response.json();
    },
  });

  const categories = data?.data ?? [];

  return (
    <section className="bg-white py-20">
      <Container>
        <div className="mb-12">
          <span className="text-sm font-semibold uppercase tracking-wider text-brand-blue">
            Категории
          </span>
          <h2 className="mt-3 text-3xl font-bold text-brand-graphite xl:text-4xl">
            Выберите тип оборудования
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.length === 0 ? (
            <p className="col-span-full py-8 text-center text-brand-graphite/50">
              Категории скоро появятся
            </p>
          ) : categories.map((category) => (
            <button
              key={category.id}
              type="button"
              className={cn(
                "group flex items-start gap-4 rounded-card border border-border-subtle bg-brand-white p-6 text-left transition-all duration-200",
                "hover:border-brand-blue hover:shadow-sm",
              )}
            >
              <span className="mt-1 text-2xl">{icons[category.slug] ?? "📦"}</span>

              <div>
                <h3 className="text-base font-semibold text-brand-graphite group-hover:text-brand-blue">
                  {category.name}
                </h3>
                {category.description ? (
                  <p className="mt-2 text-sm leading-6 text-brand-graphite/60">
                    {category.description}
                  </p>
                ) : null}
                {category.familiesCount > 0 ? (
                  <p className="mt-1 text-xs text-brand-graphite/40">
                    {category.familiesCount} {category.familiesCount === 1 ? "семейство" : "семейств"}
                  </p>
                ) : null}
              </div>
            </button>
          ))}
        </div>
      </Container>
    </section>
  );
}
