"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { TextInput } from "@/components/ui/text-input";

export default function NewCmsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const createMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/v1/cms/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, title, description: description || undefined }),
      });
      if (!response.ok) throw new Error("Failed to create page");
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "cms", "pages"] });
      router.push(`/admin/cms/${data.data.id}` as Route);
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-graphite">Новая страница</h1>
        <p className="mt-2 text-sm text-brand-graphite/70">
          Создайте новую страницу для сайта.
        </p>
      </div>

      <div className="max-w-xl space-y-4 rounded-card border border-border-subtle bg-brand-white p-6">
        <div>
          <label htmlFor="page-slug" className="mb-1.5 block text-sm font-medium text-brand-graphite">
            Slug *
          </label>
          <TextInput
            id="page-slug"
            placeholder="about-us"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
          />
          <p className="mt-1 text-xs text-brand-graphite/50">
            Уникальный идентификатор URL. Например: about-us, contacts
          </p>
        </div>

        <div>
          <label htmlFor="page-title" className="mb-1.5 block text-sm font-medium text-brand-graphite">
            Заголовок *
          </label>
          <TextInput
            id="page-title"
            placeholder="О компании"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="page-description" className="mb-1.5 block text-sm font-medium text-brand-graphite">
            Описание
          </label>
          <TextInput
            id="page-description"
            placeholder="Краткое описание страницы"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            onClick={() => createMutation.mutate()}
            disabled={!slug || !title || createMutation.isPending}
          >
            {createMutation.isPending ? "Создание..." : "Создать страницу"}
          </Button>
          <Button variant="ghost" onClick={() => router.back()}>
            Отмена
          </Button>
        </div>
      </div>
    </div>
  );
}
