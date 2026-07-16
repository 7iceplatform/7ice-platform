"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useRef } from "react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { TextInput } from "@/components/ui/text-input";
import { imageLoader } from "@/lib/image-loader";

interface MediaItem {
  id: string;
  filename: string;
  url: string;
  mimeType: string;
  size: number;
  alt: string | null;
  createdAt: string;
}

interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

interface MediaResponse {
  data: MediaItem[];
  pagination: Pagination;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} Б`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} КБ`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`;
}

const IMAGE_MIMES = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"];

export function MediaLibrary() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [uploading, setUploading] = useState(false);

  const { data, isLoading } = useQuery<MediaResponse>({
    queryKey: ["admin", "media", { search, page }],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), pageSize: "20" });
      if (search) params.set("search", search);
      const response = await fetch(`/api/v1/admin/media?${params}`);
      if (!response.ok) throw new Error("Failed to fetch media");
      return response.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (mediaId: string) => {
      const response = await fetch(`/api/v1/admin/media/${mediaId}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete");
      return response.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "media"] }),
  });

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);
        await fetch("/api/v1/admin/media", { method: "POST", body: formData });
      }
      queryClient.invalidateQueries({ queryKey: ["admin", "media"] });
    } finally {
      setUploading(false);
    }
  };

  const items = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex-1">
          <label htmlFor="media-search" className="mb-1.5 block text-sm font-medium text-brand-graphite">Поиск</label>
          <TextInput
            id="media-search"
            placeholder="Имя файла..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
            multiple
            className="hidden"
            onChange={(e) => handleUpload(e.target.files)}
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? "Загрузка..." : "Загрузить файл"}
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-card border border-border-subtle">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-muted text-xs uppercase tracking-wide text-brand-graphite/60">
            <tr>
              <th scope="col" className="px-4 py-3">Превью</th>
              <th scope="col" className="px-4 py-3">Имя файла</th>
              <th scope="col" className="px-4 py-3">Тип</th>
              <th scope="col" className="px-4 py-3">Размер</th>
              <th scope="col" className="px-4 py-3">ALT</th>
              <th scope="col" className="px-4 py-3">Дата</th>
              <th scope="col" className="px-4 py-3">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {isLoading ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-brand-graphite/50">Загрузка...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-brand-graphite/50">Файлов нет</td></tr>
            ) : items.map((m) => (
              <tr key={m.id} className="bg-brand-white">
                <td className="px-4 py-3">
                  {IMAGE_MIMES.includes(m.mimeType) ? (
                    <Image loader={imageLoader} src={m.url} alt={m.alt ?? m.filename} width={40} height={40} className="h-10 w-10 rounded object-cover" />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded bg-surface-muted text-xs text-brand-graphite/50">
                      {m.mimeType.split("/")[1]?.toUpperCase() ?? "?"}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 font-medium text-brand-graphite">{m.filename}</td>
                <td className="px-4 py-3 text-brand-graphite/60">{m.mimeType}</td>
                <td className="px-4 py-3 text-brand-graphite/60">{formatSize(m.size)}</td>
                <td className="px-4 py-3 text-brand-graphite/60">{m.alt ?? "—"}</td>
                <td className="px-4 py-3 text-brand-graphite/60">{new Date(m.createdAt).toLocaleDateString("ru-RU")}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => navigator.clipboard.writeText(m.url)}
                    >
                      URL
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        if (confirm("Удалить файл?")) deleteMutation.mutate(m.id);
                      }}
                      disabled={deleteMutation.isPending}
                    >
                      Удалить
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination && pagination.totalPages > 1 ? (
        <div className="flex items-center justify-between text-sm text-brand-graphite/60">
          <span>Всего: {pagination.total}</span>
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>Назад</Button>
            <span className="flex items-center px-3">{page} / {pagination.totalPages}</span>
            <Button size="sm" variant="secondary" onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))} disabled={page >= pagination.totalPages}>Вперёд</Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
