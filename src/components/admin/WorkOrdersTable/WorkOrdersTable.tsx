"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface WorkOrder {
  id: string;
  workOrderNumber: number;
  type: string;
  status: string;
  title: string;
  contactName: string | null;
  companyName: string | null;
  technicianName: string | null;
  scheduledAt: string | null;
  estimatedEndAt: string | null;
  completedAt: string | null;
  siteAddress: string | null;
  createdAt: string;
}

interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

interface WorkOrdersResponse {
  data: WorkOrder[];
  pagination: Pagination;
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

const VALID_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ["PLANNED", "CANCELLED"],
  PLANNED: ["SCHEDULED", "CANCELLED"],
  SCHEDULED: ["IN_PROGRESS", "ON_HOLD", "CANCELLED"],
  IN_PROGRESS: ["QUALITY_REVIEW", "ON_HOLD", "SCHEDULED"],
  ON_HOLD: ["SCHEDULED", "CANCELLED"],
  QUALITY_REVIEW: ["COMPLETED", "IN_PROGRESS"],
};

export function WorkOrdersTable() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState("");
  const [type, setType] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery<WorkOrdersResponse>({
    queryKey: ["admin", "orders", { status, type, page }],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), pageSize: "20" });
      if (status) params.set("status", status);
      if (type) params.set("type", type);
      const response = await fetch(`/api/v1/admin/orders?${params}`);
      if (!response.ok) throw new Error("Failed to fetch work orders");
      return response.json();
    },
  });

  const transitionMutation = useMutation({
    mutationFn: async ({ orderId, newStatus }: { orderId: string; newStatus: string }) => {
      const response = await fetch(`/api/v1/admin/orders/${orderId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) throw new Error("Failed to transition status");
      return response.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "orders"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const response = await fetch(`/api/v1/admin/orders/${orderId}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete");
      return response.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "orders"] }),
  });

  const orders = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-4">
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
        <div>
          <label htmlFor="wo-type" className="mb-1.5 block text-sm font-medium text-brand-graphite">Тип</label>
          <select
            id="wo-type"
            value={type}
            onChange={(e) => { setType(e.target.value); setPage(1); }}
            className="h-10 rounded-card border border-border-subtle bg-brand-white px-3 text-sm text-brand-graphite"
          >
            <option value="">Все</option>
            {Object.entries(typeLabels).map(([key, label]) => (
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
              <th scope="col" className="px-4 py-3">Название</th>
              <th scope="col" className="px-4 py-3">Тип</th>
              <th scope="col" className="px-4 py-3">Статус</th>
              <th scope="col" className="px-4 py-3">Контакт</th>
              <th scope="col" className="px-4 py-3">Компания</th>
              <th scope="col" className="px-4 py-3">Техник</th>
              <th scope="col" className="px-4 py-3">Дата</th>
              <th scope="col" className="px-4 py-3">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {isLoading ? (
              <tr><td colSpan={9} className="px-4 py-8 text-center text-brand-graphite/50">Загрузка...</td></tr>
            ) : orders.length === 0 ? (
              <tr><td colSpan={9} className="px-4 py-8 text-center text-brand-graphite/50">Заказы не найдены</td></tr>
            ) : orders.map((o) => (
              <tr key={o.id} className="bg-brand-white">
                <td className="px-4 py-3 font-medium text-brand-graphite">
                  <Link href={`/admin/orders/${o.id}` as Route} className="hover:text-brand-blue">
                    #{o.workOrderNumber}
                  </Link>
                </td>
                <td className="px-4 py-3 font-medium text-brand-graphite">{o.title}</td>
                <td className="px-4 py-3 text-brand-graphite/60">{typeLabels[o.type] ?? o.type}</td>
                <td className="px-4 py-3"><Badge tone={statusTone[o.status] ?? "default"}>{statusLabels[o.status] ?? o.status}</Badge></td>
                <td className="px-4 py-3 text-brand-graphite/60">{o.contactName ?? "—"}</td>
                <td className="px-4 py-3 text-brand-graphite/60">{o.companyName ?? "—"}</td>
                <td className="px-4 py-3 text-brand-graphite/60">{o.technicianName ?? "—"}</td>
                <td className="px-4 py-3 text-brand-graphite/60">
                  {o.scheduledAt ? new Date(o.scheduledAt).toLocaleDateString("ru-RU") : new Date(o.createdAt).toLocaleDateString("ru-RU")}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    {(VALID_TRANSITIONS[o.status] ?? []).slice(0, 2).map((nextStatus) => (
                      <Button
                        key={nextStatus}
                        size="sm"
                        variant="secondary"
                        onClick={() => transitionMutation.mutate({ orderId: o.id, newStatus: nextStatus })}
                      >
                        {statusLabels[nextStatus] ?? nextStatus}
                      </Button>
                    ))}
                    {o.status === "DRAFT" && (
                      <Button size="sm" variant="secondary" onClick={() => deleteMutation.mutate(o.id)}>
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
