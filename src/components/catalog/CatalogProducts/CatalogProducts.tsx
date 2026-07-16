"use client";

import { useQuery } from "@tanstack/react-query";

import { Container } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Product {
  id: string;
  model: string;
  name: string;
  description: string | null;
  priceAmount: number;
  priceCurrency: string;
  family: { id: string; name: string; slug: string } | null;
}

function formatPrice(amount: number, currency: string): string {
  if (currency === "RUB") {
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "RUB",
      maximumFractionDigits: 0,
    }).format(amount);
  }
  return `${amount.toLocaleString("ru-RU")} ${currency}`;
}

export function CatalogProducts() {
  const { data, isLoading } = useQuery<{ data: Product[] }>({
    queryKey: ["public", "catalog", "products"],
    queryFn: async () => {
      const response = await fetch("/api/v1/public/catalog/products?pageSize=12");
      if (!response.ok) throw new Error("Failed to fetch products");
      return response.json();
    },
  });

  const products = data?.data ?? [];

  return (
    <section className="bg-surface-muted py-20">
      <Container>
        <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="text-sm font-semibold uppercase tracking-wider text-brand-blue">
              Популярные модели
            </span>
            <h2 className="mt-3 text-3xl font-bold text-brand-graphite xl:text-4xl">
              Оборудование в наличии
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            <div className="col-span-full py-8 text-center text-brand-graphite/50">Загрузка...</div>
          ) : products.length === 0 ? (
            <div className="col-span-full py-8 text-center text-brand-graphite/50">
              Оборудование скоро появится
            </div>
          ) : products.map((product) => (
            <article
              key={product.id}
              className="group flex flex-col rounded-card border border-border-subtle bg-brand-white transition-all duration-200 hover:border-brand-blue hover:shadow-sm"
            >
              <div className="flex items-start justify-between p-6 pb-0">
                <Badge tone="default">{product.family?.name ?? "Оборудование"}</Badge>
              </div>

              <div className="flex flex-1 flex-col p-6">
                <span className="text-xs font-medium text-brand-graphite/50">
                  {product.model}
                </span>
                <h3 className="mt-1 text-lg font-semibold text-brand-graphite">
                  {product.name}
                </h3>

                {product.description ? (
                  <p className="mt-2 text-sm text-brand-graphite/60 line-clamp-2">
                    {product.description}
                  </p>
                ) : null}

                <div className="mt-auto pt-6">
                  {product.priceAmount > 0 ? (
                    <div className="text-xl font-bold text-brand-graphite">
                      {formatPrice(product.priceAmount, product.priceCurrency)}
                    </div>
                  ) : (
                    <div className="text-xl font-bold text-brand-graphite/50">
                      Цена по запросу
                    </div>
                  )}

                  <div className="mt-4 flex gap-3">
                    <Button size="sm" fullWidth>
                      Заказать
                    </Button>
                    <Button size="sm" variant="secondary" fullWidth>
                      Подробнее
                    </Button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
