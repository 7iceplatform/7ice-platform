"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { TextInput } from "@/components/ui/text-input";

interface Product {
  id: string;
  model: string;
  name: string;
  description: string | null;
  priceAmount: number | null;
  priceCurrency: string | null;
  isActive: boolean;
  family: { id: string; name: string; slug: string };
  optionsCount: number;
  createdAt: string;
}

interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

interface ProductsResponse {
  data: Product[];
  pagination: Pagination;
}

function formatPrice(amount: number | null, currency: string | null): string {
  if (amount === null) return "—";
  const formatter = new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: currency ?? "RUB",
    maximumFractionDigits: 0,
  });
  return formatter.format(amount / 100);
}

export function ProductsTable() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery<ProductsResponse>({
    queryKey: ["admin", "catalog", "products", { search, page }],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), pageSize: "20" });
      if (search) params.set("search", search);
      const response = await fetch(`/api/v1/admin/catalog/products?${params}`);
      if (!response.ok) throw new Error("Failed to fetch products");
      return response.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (productId: string) => {
      const response = await fetch(`/api/v1/admin/catalog/products/${productId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const respData = await response.json();
        throw new Error(respData.detail ?? "Failed to delete product");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "catalog", "products"] });
    },
  });

  const products = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex-1">
          <label htmlFor="product-search" className="mb-1.5 block text-sm font-medium text-brand-graphite">
            Поиск
          </label>
          <TextInput
            id="product-search"
            placeholder="Модель или название..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-card border border-border-subtle">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-muted text-xs uppercase tracking-wide text-brand-graphite/60">
            <tr>
              <th scope="col" className="px-4 py-3">Модель</th>
              <th scope="col" className="px-4 py-3">Название</th>
              <th scope="col" className="px-4 py-3">Семейство</th>
              <th scope="col" className="px-4 py-3">Цена</th>
              <th scope="col" className="px-4 py-3">Опции</th>
              <th scope="col" className="px-4 py-3">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {isLoading ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-brand-graphite/50">Загрузка...</td></tr>
            ) : products.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-brand-graphite/50">Продукты не найдены</td></tr>
            ) : (
              products.map((p) => (
                <tr key={p.id} className="bg-brand-white">
                  <td className="px-4 py-3 font-mono text-xs text-brand-graphite">{p.model}</td>
                  <td className="px-4 py-3 font-medium text-brand-graphite">{p.name}</td>
                  <td className="px-4 py-3 text-brand-graphite/60">{p.family.name}</td>
                  <td className="px-4 py-3 text-brand-graphite/60">{formatPrice(p.priceAmount, p.priceCurrency)}</td>
                  <td className="px-4 py-3 text-brand-graphite/60">{p.optionsCount}</td>
                  <td className="px-4 py-3">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        if (confirm(`Удалить продукт "${p.name}"?`)) {
                          deleteMutation.mutate(p.id);
                        }
                      }}
                    >
                      Удалить
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && pagination.totalPages > 1 ? (
        <div className="flex items-center justify-between text-sm text-brand-graphite/60">
          <span>
            Стр. {pagination.page} из {pagination.totalPages} ({pagination.total} всего)
          </span>
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Назад
            </Button>
            <Button size="sm" variant="secondary" disabled={page >= pagination.totalPages} onClick={() => setPage((p) => p + 1)}>
              Далее
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
