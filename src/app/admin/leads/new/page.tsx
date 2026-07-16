"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function NewLeadPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    company: "", source: "WEBSITE", campaign: "", notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/v1/admin/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          lastName: form.lastName || undefined,
          phone: form.phone || undefined,
          company: form.company || undefined,
          campaign: form.campaign || undefined,
          notes: form.notes || undefined,
        }),
      });
      if (res.ok) {
        const { data } = await res.json();
        router.push(`/admin/leads/${data.id}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-xl font-semibold text-[--color-7ice-graphite]">Новый лид</h1>
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[--color-7ice-graphite] mb-1">Имя *</label>
              <input type="text" required value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                className="w-full rounded-lg border border-[--color-7ice-border] px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[--color-7ice-graphite] mb-1">Фамилия</label>
              <input type="text" value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                className="w-full rounded-lg border border-[--color-7ice-border] px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[--color-7ice-graphite] mb-1">Email *</label>
              <input type="email" required value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-lg border border-[--color-7ice-border] px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[--color-7ice-graphite] mb-1">Телефон</label>
              <input type="tel" value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full rounded-lg border border-[--color-7ice-border] px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[--color-7ice-graphite] mb-1">Компания</label>
              <input type="text" value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                className="w-full rounded-lg border border-[--color-7ice-border] px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[--color-7ice-graphite] mb-1">Источник</label>
              <select value={form.source}
                onChange={(e) => setForm({ ...form, source: e.target.value })}
                className="w-full rounded-lg border border-[--color-7ice-border] px-3 py-2 text-sm">
                <option value="WEBSITE">Сайт</option>
                <option value="REFERRAL">Рекомендация</option>
                <option value="ADVERTISEMENT">Реклама</option>
                <option value="SOCIAL_MEDIA">Соцсети</option>
                <option value="TRADE_SHOW">Выставка</option>
                <option value="COLD_CALL">Холодный звонок</option>
                <option value="OTHER">Другое</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[--color-7ice-graphite] mb-1">Кампания</label>
            <input type="text" value={form.campaign}
              onChange={(e) => setForm({ ...form, campaign: e.target.value })}
              className="w-full rounded-lg border border-[--color-7ice-border] px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[--color-7ice-graphite] mb-1">Заметки</label>
            <textarea rows={3} value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full rounded-lg border border-[--color-7ice-border] px-3 py-2 text-sm" />
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
