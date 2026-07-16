"use client";

import { useState } from "react";

import { CategoriesTable } from "@/components/admin/CategoriesTable/CategoriesTable";
import { ProductsTable } from "@/components/admin/ProductsTable/ProductsTable";

type Tab = "categories" | "products";

const tabLabels: Record<Tab, string> = {
  categories: "Категории",
  products: "Продукты",
};

export default function AdminCatalogPage() {
  const [tab, setTab] = useState<Tab>("categories");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-graphite">Каталог</h1>
        <p className="mt-2 text-sm text-brand-graphite/70">
          Управление категориями и продуктами каталога.
        </p>
      </div>

      <div className="flex gap-1 border-b border-border-subtle">
        {(Object.keys(tabLabels) as Tab[]).map((key) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              tab === key
                ? "border-b-2 border-brand-blue text-brand-blue"
                : "text-brand-graphite/60 hover:text-brand-graphite"
            }`}
          >
            {tabLabels[key]}
          </button>
        ))}
      </div>

      {tab === "categories" && <CategoriesTable />}
      {tab === "products" && <ProductsTable />}
    </div>
  );
}
