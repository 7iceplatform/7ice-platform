"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import type { Route } from "next";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Order {
  id: string;
  number: number;
  type: string;
  status: string;
  title: string;
  scheduledAt: string | null;
  createdAt: string;
}

const statusLabels: Record<string, string> = {
  DRAFT: "Черновик",
  PLANNED: "Запланирован",
  SCHEDULED: "Назначен",
  IN_PROGRESS: "В работе",
  ON_HOLD: "Приостановлен",
  QUALITY_REVIEW: "Проверка",
  COMPLETED: "Завершён",
  CANCELLED: "Отменён",
};

const typeLabels: Record<string, string> = {
  INSTALLATION: "Монтаж",
  SERVICE: "Обслуживание",
  MAINTENANCE: "ТО",
  REMEDIATION: "Ремонт",
};

const statusTone: Record<string, "default" | "info" | "success" | "warning"> = {
  DRAFT: "default",
  PLANNED: "info",
  SCHEDULED: "info",
  IN_PROGRESS: "warning",
  ON_HOLD: "default",
  QUALITY_REVIEW: "info",
  COMPLETED: "success",
  CANCELLED: "default",
};

export default function PortalOrdersPage() {
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const params = new URLSearchParams({ page: String(page), pageSize: "20" });
  if (status) params.set("status", status);

  const { data, isLoading } = useQuery<{ data: Order[]; pagination: { page: number; totalPages: number; total: number } }>({
    queryKey: ["portal", "orders", params.toString()],
    queryFn: async () => {
      const response = await fetch(`/api/v1/portal/orders?${params}`);
      if (!response.ok) throw new Error("Failed to fetch orders");
      return response.json();
    },
  });

  const orders = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <div className="min-h-screen bg-surface-muted">
      <header className="border-b border-border-subtle bg-brand-white">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-6">
          <span className="text-lg font-bold text-brand-graphite">7ice Кабинет</span>
          <div className="flex gap-4">
            <Link className="text-sm font-medium text-brand-graphite/60 hover:text-brand-graphite" href={"/portal" as Route}>Главная</Link>
            <Link className="text-sm font-medium text-brand-blue hover:opacity-80" href={"/portal/orders" as Route}>Заказы</Link>
            <Link className="text-sm font-medium text-brand-graphite/60 hover:text-brand-graphite" href={"/portal/invoices" as Route}>Счета</Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-6 px-6 py-8">
        <h1 className="text-2xl font-bold text-brand-graphite">Мои заказы</h1>

        <div className="flex items-end gap-4">
          <div>
            <label htmlFor="wo-status" className="mb-1.5 block text-sm font-medium text-brand-graphite">Статус</label>
            <select
              id="wo-status"
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              className="h-10 rounded-card border border-border-subtle bg-brand-white px-3 text-sm text-brand-graphite"
            >
              <option value="">Все</option>
              {Object.entries(statusLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-hidden rounded-card border border-border-subtle">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-muted text-xs uppercase tracking-wide text-brand-graphite/60">
              <tr>
                <th className="px-4 py-3">№</th>
                <th className="px-4 py-3">Название</th>
                <th className="px-4 py-3">Тип</th>
                <th className="px-4 py-3">Статус</th>
                <th className="px-4 py-3">Дата</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {isLoading ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-brand-graphite/50">Загрузка...</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-brand-graphite/50">Заказов нет</td></tr>
              ) : orders.map((o) => (
                <tr key={o.id} className="bg-brand-white">
                  <td className="px-4 py-3 font-medium text-brand-graphite">
                    <Link href={`/portal/orders/${o.id}` as Route} className="hover:text-brand-blue">
                      #{o.number}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-brand-graphite">{o.title}</td>
                  <td className="px-4 py-3 text-brand-graphite/60">{typeLabels[o.type] ?? o.type}</td>
                  <td className="px-4 py-3"><Badge tone={statusTone[o.status] ?? "default"}>{statusLabels[o.status] ?? o.status}</Badge></td>
                  <td className="px-4 py-3 text-brand-graphite/60">
                    {o.scheduledAt ? new Date(o.scheduledAt).toLocaleDateString("ru-RU") : new Date(o.createdAt).toLocaleDateString("ru-RU")}
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
      </main>
    </div>
  );
}
