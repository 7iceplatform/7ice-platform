"use client";

import Link from "next/link";
import type { Route } from "next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { TextInput } from "@/components/ui/text-input";
import { Badge } from "@/components/ui/badge";

interface Page {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  status: string;
  latestVersion: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

interface PagesResponse {
  data: Page[];
  pagination: Pagination;
}

const statusLabels: Record<string, string> = {
  DRAFT: "Черновик",
  IN_REVIEW: "На проверке",
  APPROVED: "Утверждено",
  SCHEDULED: "Запланировано",
  PUBLISHED: "Опубликовано",
  ARCHIVED: "В архиве",
  RESTORED: "Восстановлено",
};

const statusTones: Record<string, "info" | "success" | "warning" | "default"> = {
  DRAFT: "default",
  IN_REVIEW: "warning",
  APPROVED: "info",
  SCHEDULED: "info",
  PUBLISHED: "success",
  ARCHIVED: "default",
  RESTORED: "info",
};

export function PagesTable() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery<PagesResponse>({
    queryKey: ["admin", "cms", "pages", { search, page }],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), pageSize: "20" });
      if (search) params.set("search", search);

      const response = await fetch(`/api/v1/cms/pages?${params}`);
      if (!response.ok) throw new Error("Failed to fetch pages");
      return response.json();
    },
  });

  const publishMutation = useMutation({
    mutationFn: async (pageId: string) => {
      const response = await fetch(`/api/v1/cms/pages/${pageId}/publish`, {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to publish page");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "cms", "pages"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (pageId: string) => {
      const response = await fetch(`/api/v1/cms/pages/${pageId}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete page");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "cms", "pages"] });
    },
  });

  const pages = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex-1">
          <label htmlFor="page-search" className="mb-1.5 block text-sm font-medium text-brand-graphite">
            Поиск
          </label>
          <TextInput
            id="page-search"
            placeholder="Название или slug..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-card border border-border-subtle">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-muted text-xs uppercase tracking-wide text-brand-graphite/60">
            <tr>
              <th scope="col" className="px-4 py-3">Название</th>
              <th scope="col" className="px-4 py-3">Slug</th>
              <th scope="col" className="px-4 py-3">Статус</th>
              <th scope="col" className="px-4 py-3">Версия</th>
              <th scope="col" className="px-4 py-3">Обновлено</th>
              <th scope="col" className="px-4 py-3">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-brand-graphite/50">
                  Загрузка...
                </td>
              </tr>
            ) : pages.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-brand-graphite/50">
                  Страницы не найдены
                </td>
              </tr>
            ) : (
              pages.map((pg) => (
                <tr key={pg.id} className="bg-brand-white">
                  <td className="px-4 py-3 font-medium text-brand-graphite">
                    <Link className="hover:text-brand-blue" href={`/admin/cms/${pg.id}` as Route}>
                      {pg.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-brand-graphite/60">
                    /{pg.slug}
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={statusTones[pg.status] ?? "default"}>
                      {statusLabels[pg.status] ?? pg.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-brand-graphite/60">
                    v{pg.latestVersion}
                  </td>
                  <td className="px-4 py-3 text-brand-graphite/60">
                    {new Date(pg.updatedAt).toLocaleDateString("ru-RU")}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {pg.status !== "PUBLISHED" && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => publishMutation.mutate(pg.id)}
                        >
                          Опубликовать
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          if (confirm("Удалить страницу?")) deleteMutation.mutate(pg.id);
                        }}
                        disabled={deleteMutation.isPending}
                      >
                        Удалить
                      </Button>
                    </div>
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
            <Button
              size="sm"
              variant="secondary"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Назад
            </Button>
            <Button
              size="sm"
              variant="secondary"
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Далее
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
