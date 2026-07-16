"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import type { Route } from "next";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Invoice {
  id: string;
  number: number;
  status: string;
  totalCents: number;
  dueAt: string | null;
  createdAt: string;
}

const statusLabels: Record<string, string> = {
  DRAFT: "Черновик",
  ISSUED: "Выставлен",
  PAID: "Оплачен",
  OVERDUE: "Просрочен",
  CANCELLED: "Отменён",
};

const statusTone: Record<string, "default" | "info" | "success" | "warning"> = {
  DRAFT: "default",
  ISSUED: "info",
  PAID: "success",
  OVERDUE: "warning",
  CANCELLED: "default",
};

function formatCents(cents: number): string {
  return (cents / 100).toLocaleString("ru-RU", { style: "currency", currency: "RUB" });
}

export default function PortalInvoicesPage() {
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const params = new URLSearchParams({ page: String(page), pageSize: "20" });
  if (status) params.set("status", status);

  const { data, isLoading } = useQuery<{ data: Invoice[]; pagination: { page: number; totalPages: number; total: number } }>({
    queryKey: ["portal", "invoices", params.toString()],
    queryFn: async () => {
      const response = await fetch(`/api/v1/portal/invoices?${params}`);
      if (!response.ok) throw new Error("Failed to fetch invoices");
      return response.json();
    },
  });

  const invoices = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <div className="min-h-screen bg-surface-muted">
      <header className="border-b border-border-subtle bg-brand-white">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-6">
          <span className="text-lg font-bold text-brand-graphite">7ice Кабинет</span>
          <div className="flex gap-4">
            <Link className="text-sm font-medium text-brand-graphite/60 hover:text-brand-graphite" href={"/portal" as Route}>Главная</Link>
            <Link className="text-sm font-medium text-brand-graphite/60 hover:text-brand-graphite" href={"/portal/orders" as Route}>Заказы</Link>
            <Link className="text-sm font-medium text-brand-blue hover:opacity-80" href={"/portal/invoices" as Route}>Счета</Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-6 px-6 py-8">
        <h1 className="text-2xl font-bold text-brand-graphite">Мои счета</h1>

        <div className="flex items-end gap-4">
          <div>
            <label htmlFor="inv-status" className="mb-1.5 block text-sm font-medium text-brand-graphite">Статус</label>
            <select
              id="inv-status"
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
                <th className="px-4 py-3">Статус</th>
                <th className="px-4 py-3">Сумма</th>
                <th className="px-4 py-3">Срок оплаты</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {isLoading ? (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-brand-graphite/50">Загрузка...</td></tr>
              ) : invoices.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-brand-graphite/50">Счетов нет</td></tr>
              ) : invoices.map((i) => (
                <tr key={i.id} className="bg-brand-white">
                  <td className="px-4 py-3 font-medium text-brand-graphite">
                    <Link href={`/portal/invoices/${i.id}` as Route} className="hover:text-brand-blue">
                      #{i.number}
                    </Link>
                  </td>
                  <td className="px-4 py-3"><Badge tone={statusTone[i.status] ?? "default"}>{statusLabels[i.status] ?? i.status}</Badge></td>
                  <td className="px-4 py-3 font-medium text-brand-graphite">{formatCents(i.totalCents)}</td>
                  <td className="px-4 py-3 text-brand-graphite/60">
                    {i.dueAt ? new Date(i.dueAt).toLocaleDateString("ru-RU") : "—"}
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
