"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function NewServiceCasePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    type: "INCIDENT",
    severity: "MEDIUM",
    title: "",
    description: "",
    contactId: "",
    companyId: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/v1/admin/service-cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          contactId: form.contactId || undefined,
          companyId: form.companyId || undefined,
          description: form.description || undefined,
        }),
      });
      if (res.ok) {
        const { data } = await res.json();
        router.push(`/admin/service-cases/${data.id}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-xl font-semibold text-[--color-7ice-graphite]">Новое обращение</h1>
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[--color-7ice-graphite] mb-1">Название</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full rounded-lg border border-[--color-7ice-border] px-3 py-2 text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[--color-7ice-graphite] mb-1">Тип</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full rounded-lg border border-[--color-7ice-border] px-3 py-2 text-sm">
                <option value="INCIDENT">Инцидент</option>
                <option value="REQUEST">Запрос</option>
                <option value="MAINTENANCE">Обслуживание</option>
                <option value="WARRANTY">Гарантия</option>
                <option value="COMPLAINT">Жалоба</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[--color-7ice-graphite] mb-1">Важность</label>
              <select value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })} className="w-full rounded-lg border border-[--color-7ice-border] px-3 py-2 text-sm">
                <option value="LOW">Низкая</option>
                <option value="MEDIUM">Средняя</option>
                <option value="HIGH">Высокая</option>
                <option value="CRITICAL">Критическая</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[--color-7ice-graphite] mb-1">Описание</label>
            <textarea
              rows={4}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full rounded-lg border border-[--color-7ice-border] px-3 py-2 text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[--color-7ice-graphite] mb-1">Contact ID (optional)</label>
              <input
                type="text"
                value={form.contactId}
                onChange={(e) => setForm({ ...form, contactId: e.target.value })}
                className="w-full rounded-lg border border-[--color-7ice-border] px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[--color-7ice-graphite] mb-1">Company ID (optional)</label>
              <input
                type="text"
                value={form.companyId}
                onChange={(e) => setForm({ ...form, companyId: e.target.value })}
                className="w-full rounded-lg border border-[--color-7ice-border] px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" type="button" onClick={() => router.back()}>Отмена</Button>
            <Button type="submit" disabled={loading}>{loading ? "Создание..." : "Создать"}</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
