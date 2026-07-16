"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Invoice {
  id: string;
  invoiceNumber: number;
  status: string;
  contactName: string | null;
  companyName: string | null;
  workOrderNumber: number | null;
  amountCents: number;
  taxCents: number;
  totalCents: number;
  currency: string;
  description: string | null;
  issuedAt: string | null;
  dueAt: string | null;
  paidAt: string | null;
  paidAmountCents: number;
  createdAt: string;
}

interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

interface InvoicesResponse {
  data: Invoice[];
  pagination: Pagination;
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

const VALID_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ["ISSUED", "CANCELLED"],
  ISSUED: ["PAID", "OVERDUE", "CANCELLED"],
  OVERDUE: ["PAID", "CANCELLED"],
};

function formatCents(cents: number, currency: string): string {
  const amount = cents / 100;
  return `${amount.toLocaleString("ru-RU")} ${currency}`;
}

export function InvoicesTable() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery<InvoicesResponse>({
    queryKey: ["admin", "invoices", { status, page }],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), pageSize: "20" });
      if (status) params.set("status", status);
      const response = await fetch(`/api/v1/admin/finance/invoices?${params}`);
      if (!response.ok) throw new Error("Failed to fetch invoices");
      return response.json();
    },
  });

  const transitionMutation = useMutation({
    mutationFn: async ({ invoiceId, newStatus }: { invoiceId: string; newStatus: string }) => {
      const response = await fetch(`/api/v1/admin/finance/invoices/${invoiceId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) throw new Error("Failed to transition status");
      return response.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "invoices"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (invoiceId: string) => {
      const response = await fetch(`/api/v1/admin/finance/invoices/${invoiceId}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete");
      return response.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "invoices"] }),
  });

  const invoices = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-4">
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
              <th scope="col" className="px-4 py-3">№</th>
              <th scope="col" className="px-4 py-3">Статус</th>
              <th scope="col" className="px-4 py-3">Контакт</th>
              <th scope="col" className="px-4 py-3">Компания</th>
              <th scope="col" className="px-4 py-3">Заказ</th>
              <th scope="col" className="px-4 py-3">Сумма</th>
              <th scope="col" className="px-4 py-3">Оплачено</th>
              <th scope="col" className="px-4 py-3">Срок</th>
              <th scope="col" className="px-4 py-3">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {isLoading ? (
              <tr><td colSpan={9} className="px-4 py-8 text-center text-brand-graphite/50">Загрузка...</td></tr>
            ) : invoices.length === 0 ? (
              <tr><td colSpan={9} className="px-4 py-8 text-center text-brand-graphite/50">Счета не найдены</td></tr>
            ) : invoices.map((inv) => (
              <tr key={inv.id} className="bg-brand-white">
                <td className="px-4 py-3 font-medium text-brand-graphite">
                  <Link href={`/admin/finance/invoices/${inv.id}` as Route} className="hover:text-brand-blue">
                    #{inv.invoiceNumber}
                  </Link>
                </td>
                <td className="px-4 py-3"><Badge tone={statusTone[inv.status] ?? "default"}>{statusLabels[inv.status] ?? inv.status}</Badge></td>
                <td className="px-4 py-3 text-brand-graphite/60">{inv.contactName ?? "—"}</td>
                <td className="px-4 py-3 text-brand-graphite/60">{inv.companyName ?? "—"}</td>
                <td className="px-4 py-3 text-brand-graphite/60">{inv.workOrderNumber ? `#${inv.workOrderNumber}` : "—"}</td>
                <td className="px-4 py-3 font-medium text-brand-graphite">{formatCents(inv.totalCents, inv.currency)}</td>
                <td className="px-4 py-3 text-brand-graphite/60">{formatCents(inv.paidAmountCents, inv.currency)}</td>
                <td className="px-4 py-3 text-brand-graphite/60">
                  {inv.dueAt ? new Date(inv.dueAt).toLocaleDateString("ru-RU") : "—"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    {(VALID_TRANSITIONS[inv.status] ?? []).slice(0, 2).map((nextStatus) => (
                      <Button
                        key={nextStatus}
                        size="sm"
                        variant="secondary"
                        onClick={() => transitionMutation.mutate({ invoiceId: inv.id, newStatus: nextStatus })}
                      >
                        {statusLabels[nextStatus] ?? nextStatus}
                      </Button>
                    ))}
                    {inv.status === "DRAFT" && (
                      <Button size="sm" variant="secondary" onClick={() => deleteMutation.mutate(inv.id)}>
                        Удалить
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination && pagination.totalPages > 1 ? (
        <div className="flex items-center justify-between text-sm text-brand-graphite/60">
          <span>Стр. {pagination.page} из {pagination.totalPages} ({pagination.total} всего)</span>
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Назад</Button>
            <Button size="sm" variant="secondary" disabled={page >= pagination.totalPages} onClick={() => setPage((p) => p + 1)}>Далее</Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
