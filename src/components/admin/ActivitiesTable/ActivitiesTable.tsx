"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Activity {
  id: string;
  type: string;
  subject: string;
  body: string | null;
  contact: { id: string; firstName: string; lastName: string | null } | null;
  deal: { id: string; title: string } | null;
  dueAt: string | null;
  completedAt: string | null;
  createdAt: string;
}

interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

interface ActivitiesResponse {
  data: Activity[];
  pagination: Pagination;
}

const typeLabels: Record<string, string> = {
  CALL: "Звонок",
  EMAIL: "Письмо",
  MEETING: "Встреча",
  TASK: "Задача",
  NOTE: "Заметка",
};

const typeTone: Record<string, "default" | "info" | "success" | "warning"> = {
  CALL: "info",
  EMAIL: "default",
  MEETING: "warning",
  TASK: "success",
  NOTE: "default",
};

export function ActivitiesTable({ contactId, dealId }: { contactId?: string; dealId?: string }) {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [type, setType] = useState("");

  const params = new URLSearchParams({ page: String(page), pageSize: "20" });
  if (type) params.set("type", type);
  if (contactId) params.set("contactId", contactId);
  if (dealId) params.set("dealId", dealId);

  const { data, isLoading } = useQuery<ActivitiesResponse>({
    queryKey: ["admin", "activities", params.toString()],
    queryFn: async () => {
      const response = await fetch(`/api/v1/admin/crm/activities?${params}`);
      if (!response.ok) throw new Error("Failed to fetch activities");
      return response.json();
    },
  });

  const completeMutation = useMutation({
    mutationFn: async (activityId: string) => {
      const response = await fetch(`/api/v1/admin/crm/activities/${activityId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completedAt: new Date().toISOString() }),
      });
      if (!response.ok) throw new Error("Failed to complete");
      return response.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "activities"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (activityId: string) => {
      const response = await fetch(`/api/v1/admin/crm/activities/${activityId}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete");
      return response.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "activities"] }),
  });

  const activities = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-4">
      <div className="flex items-end gap-4">
        <div>
          <label htmlFor="activity-type" className="mb-1.5 block text-sm font-medium text-brand-graphite">Тип</label>
          <select
            id="activity-type"
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
              <th scope="col" className="px-4 py-3">Тип</th>
              <th scope="col" className="px-4 py-3">Тема</th>
              <th scope="col" className="px-4 py-3">Контакт</th>
              <th scope="col" className="px-4 py-3">Сделка</th>
              <th scope="col" className="px-4 py-3">Срок</th>
              <th scope="col" className="px-4 py-3">Статус</th>
              <th scope="col" className="px-4 py-3">Дата</th>
              <th scope="col" className="px-4 py-3">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {isLoading ? (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-brand-graphite/50">Загрузка...</td></tr>
            ) : activities.length === 0 ? (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-brand-graphite/50">Активности не найдены</td></tr>
            ) : activities.map((a) => (
              <tr key={a.id} className="bg-brand-white">
                <td className="px-4 py-3"><Badge tone={typeTone[a.type] ?? "default"}>{typeLabels[a.type] ?? a.type}</Badge></td>
                <td className="px-4 py-3 font-medium text-brand-graphite">{a.subject}</td>
                <td className="px-4 py-3 text-brand-graphite/60">
                  {a.contact ? `${a.contact.firstName} ${a.contact.lastName ?? ""}` : "—"}
                </td>
                <td className="px-4 py-3 text-brand-graphite/60">{a.deal?.title ?? "—"}</td>
                <td className="px-4 py-3 text-brand-graphite/60">
                  {a.dueAt ? new Date(a.dueAt).toLocaleDateString("ru-RU") : "—"}
                </td>
                <td className="px-4 py-3">
                  <Badge tone={a.completedAt ? "success" : "default"}>
                    {a.completedAt ? "Завершена" : "В работе"}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-brand-graphite/60">
                  {new Date(a.createdAt).toLocaleDateString("ru-RU")}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    {!a.completedAt ? (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => completeMutation.mutate(a.id)}
                        disabled={completeMutation.isPending}
                      >
                        Завершить
                      </Button>
                    ) : null}
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => deleteMutation.mutate(a.id)}
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
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              Назад
            </Button>
            <span className="flex items-center px-3">{page} / {pagination.totalPages}</span>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={page >= pagination.totalPages}
            >
              Вперёд
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
