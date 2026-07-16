"use client";

import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, use } from "react";

import { Button } from "@/components/ui/button";
import { TextInput } from "@/components/ui/text-input";
import { Badge } from "@/components/ui/badge";

interface Block {
  id: string;
  type: string;
  order: number;
  content: Record<string, unknown>;
  createdAt: string;
}

interface PageData {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  metaTitle: string | null;
  metaDesc: string | null;
  status: string;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  revisions: Array<{
    id: string;
    version: number;
    content: Record<string, unknown>;
    status: string;
    createdAt: string;
    blocks: Array<{
      id: string;
      type: string;
      order: number;
      content: Record<string, unknown>;
    }>;
  }>;
}

interface FormState {
  title: string;
  description: string;
  metaTitle: string;
  metaDesc: string;
}

const BLOCK_TYPE_LABELS: Record<string, string> = {
  HEADING: "Заголовок",
  TEXT: "Текст",
  IMAGE: "Изображение",
  LIST: "Список",
  QUOTE: "Цитата",
  HTML: "HTML",
  SPACER: "Разделитель",
};

const BLOCK_TYPES = ["HEADING", "TEXT", "IMAGE", "LIST", "QUOTE", "HTML", "SPACER"] as const;

function createFormState(page: PageData): FormState {
  return {
    title: page.title,
    description: page.description ?? "",
    metaTitle: page.metaTitle ?? "",
    metaDesc: page.metaDesc ?? "",
  };
}

function BlockEditor({ pageId }: { pageId: string }) {
  const queryClient = useQueryClient();
  const [newBlockType, setNewBlockType] = useState<string>("HEADING");
  const [newBlockContent, setNewBlockContent] = useState<Record<string, string>>({});

  const { data: blocksData } = useQuery<{ data: Block[] }>({
    queryKey: ["admin", "cms", "page", pageId, "blocks"],
    queryFn: async () => {
      const response = await fetch(`/api/v1/cms/pages/${pageId}/blocks`);
      if (!response.ok) throw new Error("Failed to fetch blocks");
      return response.json();
    },
  });

  const createBlockMutation = useMutation({
    mutationFn: async () => {
      const content: Record<string, unknown> = {};
      if (newBlockType === "HEADING") content.heading = newBlockContent.heading ?? "";
      if (newBlockType === "TEXT") content.body = newBlockContent.body ?? "";
      if (newBlockType === "IMAGE") {
        content.url = newBlockContent.url ?? "";
        content.alt = newBlockContent.alt ?? "";
      }
      if (newBlockType === "LIST") {
        content.items = (newBlockContent.items ?? "").split("\n").filter(Boolean);
      }
      if (newBlockType === "QUOTE") {
        content.text = newBlockContent.text ?? "";
        content.author = newBlockContent.author ?? "";
      }
      if (newBlockType === "HTML") content.html = newBlockContent.html ?? "";

      const response = await fetch(`/api/v1/cms/pages/${pageId}/blocks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: newBlockType, content }),
      });
      if (!response.ok) throw new Error("Failed to create block");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "cms", "page", pageId, "blocks"] });
      setNewBlockContent({});
    },
  });

  const deleteBlockMutation = useMutation({
    mutationFn: async (blockId: string) => {
      const response = await fetch(`/api/v1/cms/pages/${pageId}/blocks/${blockId}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete block");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "cms", "page", pageId, "blocks"] });
    },
  });

  const blocks = blocksData?.data ?? [];

  const renderBlockInputs = () => {
    switch (newBlockType) {
      case "HEADING":
        return (
          <TextInput
            placeholder="Текст заголовка"
            value={newBlockContent.heading ?? ""}
            onChange={(e) => setNewBlockContent({ ...newBlockContent, heading: e.target.value })}
          />
        );
      case "TEXT":
        return (
          <textarea
            className="min-h-[80px] w-full rounded-card border border-border-subtle bg-brand-white px-3 py-2 text-sm text-brand-graphite"
            placeholder="Текстовый блок"
            value={newBlockContent.body ?? ""}
            onChange={(e) => setNewBlockContent({ ...newBlockContent, body: e.target.value })}
          />
        );
      case "IMAGE":
        return (
          <div className="space-y-2">
            <TextInput
              placeholder="URL изображения"
              value={newBlockContent.url ?? ""}
              onChange={(e) => setNewBlockContent({ ...newBlockContent, url: e.target.value })}
            />
            <TextInput
              placeholder="ALT текст"
              value={newBlockContent.alt ?? ""}
              onChange={(e) => setNewBlockContent({ ...newBlockContent, alt: e.target.value })}
            />
          </div>
        );
      case "LIST":
        return (
          <textarea
            className="min-h-[80px] w-full rounded-card border border-border-subtle bg-brand-white px-3 py-2 text-sm text-brand-graphite"
            placeholder="Элементы списка (по одному на строку)"
            value={newBlockContent.items ?? ""}
            onChange={(e) => setNewBlockContent({ ...newBlockContent, items: e.target.value })}
          />
        );
      case "QUOTE":
        return (
          <div className="space-y-2">
            <TextInput
              placeholder="Текст цитаты"
              value={newBlockContent.text ?? ""}
              onChange={(e) => setNewBlockContent({ ...newBlockContent, text: e.target.value })}
            />
            <TextInput
              placeholder="Автор"
              value={newBlockContent.author ?? ""}
              onChange={(e) => setNewBlockContent({ ...newBlockContent, author: e.target.value })}
            />
          </div>
        );
      case "HTML":
        return (
          <textarea
            className="min-h-[80px] w-full rounded-card border border-border-subtle bg-brand-white px-3 py-2 font-mono text-sm text-brand-graphite"
            placeholder="HTML код"
            value={newBlockContent.html ?? ""}
            onChange={(e) => setNewBlockContent({ ...newBlockContent, html: e.target.value })}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="rounded-card border border-border-subtle bg-brand-white p-6 space-y-4">
      <h3 className="text-sm font-medium text-brand-graphite">Блоки контента</h3>

      {blocks.length > 0 ? (
        <div className="space-y-2">
          {blocks.map((block) => (
            <div key={block.id} className="flex items-center justify-between rounded border border-border-subtle px-3 py-2">
              <div className="flex items-center gap-3">
                <Badge tone="default">{BLOCK_TYPE_LABELS[block.type] ?? block.type}</Badge>
                <span className="text-sm text-brand-graphite/60 truncate max-w-xs">
                  {typeof block.content.heading === "string" ? block.content.heading :
                   typeof block.content.body === "string" ? block.content.body.slice(0, 60) :
                   typeof block.content.url === "string" ? block.content.url :
                   typeof block.content.text === "string" ? block.content.text.slice(0, 60) :
                   typeof block.content.html === "string" ? block.content.html.slice(0, 60) :
                   typeof block.content.items === "object" ? `${(block.content.items as string[]).length} элементов` :
                   "—"}
                </span>
              </div>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    if (confirm("Удалить блок?")) deleteBlockMutation.mutate(block.id);
                  }}
                  disabled={deleteBlockMutation.isPending}
                >
                  Удалить
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-brand-graphite/50">Блоков пока нет. Добавьте первый блок ниже.</p>
      )}

      <div className="border-t border-border-subtle pt-4 space-y-3">
        <div className="flex items-center gap-3">
          <label htmlFor="block-type" className="text-sm font-medium text-brand-graphite">Новый блок:</label>
          <select
            id="block-type"
            value={newBlockType}
            onChange={(e) => { setNewBlockType(e.target.value); setNewBlockContent({}); }}
            className="h-8 rounded border border-border-subtle bg-brand-white px-2 text-sm text-brand-graphite"
          >
            {BLOCK_TYPES.map((t) => (
              <option key={t} value={t}>{BLOCK_TYPE_LABELS[t]}</option>
            ))}
          </select>
        </div>

        {renderBlockInputs()}

        {newBlockType !== "SPACER" ? (
          <Button
            size="sm"
            onClick={() => createBlockMutation.mutate()}
            disabled={createBlockMutation.isPending}
          >
            Добавить блок
          </Button>
        ) : (
          <Button
            size="sm"
            onClick={() => createBlockMutation.mutate()}
            disabled={createBlockMutation.isPending}
          >
            Добавить разделитель
          </Button>
        )}
      </div>
    </div>
  );
}

function EditForm({
  page,
  onUpdate,
  onPublish,
  isUpdating,
  isPublishing,
}: {
  page: PageData;
  onUpdate: (form: FormState) => void;
  onPublish: () => void;
  isUpdating: boolean;
  isPublishing: boolean;
}) {
  const [form, setForm] = useState<FormState>(() => createFormState(page));

  const updateField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const statusLabels: Record<string, string> = {
    DRAFT: "Черновик",
    PUBLISHED: "Опубликовано",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-graphite">Редактирование</h1>
          <p className="mt-2 text-sm text-brand-graphite/70">
            /{page.slug} <Badge tone={page.status === "PUBLISHED" ? "success" : "default"}>{statusLabels[page.status] ?? page.status}</Badge>
          </p>
        </div>
        <div className="flex gap-3">
          {page.status !== "PUBLISHED" && (
            <Button onClick={onPublish} disabled={isPublishing}>Опубликовать</Button>
          )}
        </div>
      </div>

      <div className="max-w-2xl space-y-4 rounded-card border border-border-subtle bg-brand-white p-6">
        <div>
          <label htmlFor="edit-title" className="mb-1.5 block text-sm font-medium text-brand-graphite">Заголовок</label>
          <TextInput id="edit-title" value={form.title} onChange={(e) => updateField("title", e.target.value)} />
        </div>
        <div>
          <label htmlFor="edit-description" className="mb-1.5 block text-sm font-medium text-brand-graphite">Описание</label>
          <TextInput id="edit-description" value={form.description} onChange={(e) => updateField("description", e.target.value)} />
        </div>
        <div className="border-t border-border-subtle pt-4">
          <h3 className="mb-3 text-sm font-medium text-brand-graphite">SEO</h3>
          <div className="space-y-3">
            <div>
              <label htmlFor="edit-meta-title" className="mb-1.5 block text-xs text-brand-graphite/60">Meta Title</label>
              <TextInput id="edit-meta-title" value={form.metaTitle} onChange={(e) => updateField("metaTitle", e.target.value)} />
            </div>
            <div>
              <label htmlFor="edit-meta-desc" className="mb-1.5 block text-xs text-brand-graphite/60">Meta Description</label>
              <TextInput id="edit-meta-desc" value={form.metaDesc} onChange={(e) => updateField("metaDesc", e.target.value)} />
            </div>
          </div>
        </div>
        <div className="flex gap-3 pt-4">
          <Button onClick={() => onUpdate(form)} disabled={isUpdating}>
            {isUpdating ? "Сохранение..." : "Сохранить"}
          </Button>
        </div>
      </div>

      <BlockEditor pageId={page.id} />

      {page.revisions.length > 0 && (
        <div className="max-w-2xl rounded-card border border-border-subtle bg-brand-white p-6">
          <h3 className="mb-3 text-sm font-medium text-brand-graphite">Ревизии</h3>
          <div className="space-y-2">
            {page.revisions.map((rev) => (
              <div key={rev.id} className="flex items-center justify-between text-sm">
                <span className="text-brand-graphite/70">
                  Версия {rev.version} — {new Date(rev.createdAt).toLocaleDateString("ru-RU")}
                </span>
                <Badge tone={rev.status === "PUBLISHED" ? "success" : "default"}>
                  {rev.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function EditCmsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { id } = use(params);

  const { data: page, isLoading } = useQuery<PageData>({
    queryKey: ["admin", "cms", "page", id],
    queryFn: async () => {
      const response = await fetch(`/api/v1/cms/pages/${id}`);
      if (!response.ok) throw new Error("Failed to fetch page");
      const result = await response.json();
      return result.data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: (form: FormState) =>
      fetch(`/api/v1/cms/pages/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          description: form.description || undefined,
          metaTitle: form.metaTitle || undefined,
          metaDesc: form.metaDesc || undefined,
        }),
      }).then((r) => {
        if (!r.ok) throw new Error("Failed to update page");
        return r.json();
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "cms", "pages"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "cms", "page", id] });
    },
  });

  const publishMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/v1/cms/pages/${id}/publish`, { method: "POST" });
      if (!response.ok) throw new Error("Failed to publish page");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "cms", "pages"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "cms", "page", id] });
    },
  });

  if (isLoading) return <div className="text-brand-graphite/50">Загрузка...</div>;
  if (!page) return <div className="text-brand-graphite/50">Страница не найдена</div>;

  return (
    <>
      <EditForm
        key={page.id}
        page={page}
        onUpdate={(form) => updateMutation.mutate(form)}
        onPublish={() => publishMutation.mutate()}
        isUpdating={updateMutation.isPending}
        isPublishing={publishMutation.isPending}
      />
      <Button variant="ghost" onClick={() => router.back()}>Назад</Button>
    </>
  );
}
