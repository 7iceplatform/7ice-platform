"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { TextInput } from "@/components/ui/text-input";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parentId: string | null;
  order: number;
  isActive: boolean;
  familiesCount: number;
  childrenCount: number;
  createdAt: string;
}

interface CategoriesResponse {
  data: Category[];
}

export function CategoriesTable() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [newDescription, setNewDescription] = useState("");

  const { data, isLoading } = useQuery<CategoriesResponse>({
    queryKey: ["admin", "catalog", "categories", { search }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      const response = await fetch(`/api/v1/admin/catalog/categories?${params}`);
      if (!response.ok) throw new Error("Failed to fetch categories");
      return response.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/v1/admin/catalog/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName, slug: newSlug, description: newDescription || undefined }),
      });
      if (!response.ok) throw new Error("Failed to create category");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "catalog", "categories"] });
      setShowCreate(false);
      setNewName("");
      setNewSlug("");
      setNewDescription("");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (categoryId: string) => {
      const response = await fetch(`/api/v1/admin/catalog/categories/${categoryId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail ?? "Failed to delete category");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "catalog", "categories"] });
    },
  });

  const categories = data?.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex-1">
          <label htmlFor="cat-search" className="mb-1.5 block text-sm font-medium text-brand-graphite">
            Поиск
          </label>
          <TextInput
            id="cat-search"
            placeholder="Название или slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button onClick={() => setShowCreate(!showCreate)}>
          {showCreate ? "Отмена" : "Добавить категорию"}
        </Button>
      </div>

      {showCreate && (
        <div className="max-w-xl space-y-3 rounded-card border border-border-subtle bg-brand-white p-4">
          <div>
            <label htmlFor="new-cat-name" className="mb-1 block text-sm font-medium text-brand-graphite">Название *</label>
            <TextInput id="new-cat-name" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Сплит-системы" />
          </div>
          <div>
            <label htmlFor="new-cat-slug" className="mb-1 block text-sm font-medium text-brand-graphite">Slug *</label>
            <TextInput id="new-cat-slug" value={newSlug} onChange={(e) => setNewSlug(e.target.value)} placeholder="split-systems" />
          </div>
          <div>
            <label htmlFor="new-cat-desc" className="mb-1 block text-sm font-medium text-brand-graphite">Описание</label>
            <TextInput id="new-cat-desc" value={newDescription} onChange={(e) => setNewDescription(e.target.value)} placeholder="Краткое описание" />
          </div>
          <Button
            onClick={() => createMutation.mutate()}
            disabled={!newName || !newSlug || createMutation.isPending}
          >
            {createMutation.isPending ? "Создание..." : "Создать"}
          </Button>
        </div>
      )}

      <div className="overflow-hidden rounded-card border border-border-subtle">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-muted text-xs uppercase tracking-wide text-brand-graphite/60">
            <tr>
              <th scope="col" className="px-4 py-3">Название</th>
              <th scope="col" className="px-4 py-3">Slug</th>
              <th scope="col" className="px-4 py-3">Семейств</th>
              <th scope="col" className="px-4 py-3">Подкат.</th>
              <th scope="col" className="px-4 py-3">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {isLoading ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-brand-graphite/50">Загрузка...</td></tr>
            ) : categories.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-brand-graphite/50">Категории не найдены</td></tr>
            ) : (
              categories.map((cat) => (
                <tr key={cat.id} className="bg-brand-white">
                  <td className="px-4 py-3 font-medium text-brand-graphite">{cat.name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-brand-graphite/60">/{cat.slug}</td>
                  <td className="px-4 py-3 text-brand-graphite/60">{cat.familiesCount}</td>
                  <td className="px-4 py-3 text-brand-graphite/60">{cat.childrenCount}</td>
                  <td className="px-4 py-3">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        if (confirm(`Удалить категорию "${cat.name}"?`)) {
                          deleteMutation.mutate(cat.id);
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
    </div>
  );
}
