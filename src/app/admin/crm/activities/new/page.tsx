"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";

export default function NewActivityPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    type: "CALL" as string,
    subject: "",
    body: "",
    contactId: "",
    dealId: "",
    dueAt: "",
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const payload: Record<string, unknown> = {
        type: form.type,
        subject: form.subject,
      };
      if (form.body) payload.body = form.body;
      if (form.contactId) payload.contactId = form.contactId;
      if (form.dealId) payload.dealId = form.dealId;
      if (form.dueAt) payload.dueAt = new Date(form.dueAt).toISOString();

      const response = await fetch("/api/v1/admin/crm/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Failed to create activity");
      return response.json();
    },
    onSuccess: () => router.push("/admin/crm"),
  });

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-2xl font-bold text-brand-graphite">Новая активность</h1>

      <div className="rounded-card border border-border-subtle bg-brand-white p-6 space-y-4">
        <div>
          <label htmlFor="type" className="mb-1.5 block text-sm font-medium text-brand-graphite">Тип</label>
          <select
            id="type"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            className="h-10 w-full rounded-card border border-border-subtle bg-brand-white px-3 text-sm text-brand-graphite"
          >
            <option value="CALL">Звонок</option>
            <option value="EMAIL">Письмо</option>
            <option value="MEETING">Встреча</option>
            <option value="TASK">Задача</option>
            <option value="NOTE">Заметка</option>
          </select>
        </div>

        <div>
          <label htmlFor="subject" className="mb-1.5 block text-sm font-medium text-brand-graphite">Тема *</label>
          <input
            id="subject"
            type="text"
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
            className="h-10 w-full rounded-card border border-border-subtle bg-brand-white px-3 text-sm text-brand-graphite"
            placeholder="Тема активности"
          />
        </div>

        <div>
          <label htmlFor="body" className="mb-1.5 block text-sm font-medium text-brand-graphite">Описание</label>
          <textarea
            id="body"
            value={form.body}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
            className="min-h-[80px] w-full rounded-card border border-border-subtle bg-brand-white px-3 py-2 text-sm text-brand-graphite"
            placeholder="Подробности..."
          />
        </div>

        <div>
          <label htmlFor="dueAt" className="mb-1.5 block text-sm font-medium text-brand-graphite">Срок</label>
          <input
            id="dueAt"
            type="datetime-local"
            value={form.dueAt}
            onChange={(e) => setForm({ ...form, dueAt: e.target.value })}
            className="h-10 w-full rounded-card border border-border-subtle bg-brand-white px-3 text-sm text-brand-graphite"
          />
        </div>

        <div>
          <label htmlFor="contactId" className="mb-1.5 block text-sm font-medium text-brand-graphite">Contact ID (опционально)</label>
          <input
            id="contactId"
            type="text"
            value={form.contactId}
            onChange={(e) => setForm({ ...form, contactId: e.target.value })}
            className="h-10 w-full rounded-card border border-border-subtle bg-brand-white px-3 text-sm text-brand-graphite"
            placeholder="Связать с контактом"
          />
        </div>

        <div>
          <label htmlFor="dealId" className="mb-1.5 block text-sm font-medium text-brand-graphite">Deal ID (опционально)</label>
          <input
            id="dealId"
            type="text"
            value={form.dealId}
            onChange={(e) => setForm({ ...form, dealId: e.target.value })}
            className="h-10 w-full rounded-card border border-border-subtle bg-brand-white px-3 text-sm text-brand-graphite"
            placeholder="Связать со сделкой"
          />
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            onClick={() => createMutation.mutate()}
            disabled={!form.subject || createMutation.isPending}
          >
            {createMutation.isPending ? "Создание..." : "Создать"}
          </Button>
          <Button variant="secondary" onClick={() => router.back()}>Отмена</Button>
        </div>
      </div>
    </div>
  );
}
