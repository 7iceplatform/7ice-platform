"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Notification {
  id: string;
  title: string;
  body: string;
  channel: string;
  status: string;
  referenceType: string | null;
  referenceId: string | null;
  createdAt: string;
  sentAt: string | null;
  readAt: string | null;
}

interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

interface NotificationsResponse {
  data: Notification[];
  pagination: Pagination;
}

const statusLabels: Record<string, string> = {
  PENDING: "Ожидает",
  SENT: "Отправлено",
  DELIVERED: "Доставлено",
  FAILED: "Ошибка",
};

const statusTone: Record<string, "default" | "info" | "success" | "warning"> = {
  PENDING: "warning",
  SENT: "info",
  DELIVERED: "success",
  FAILED: "default",
};

const channelLabels: Record<string, string> = {
  IN_APP: "В приложении",
  EMAIL: "Email",
  SMS: "SMS",
  PUSH: "Push",
};

export function NotificationsTable() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery<NotificationsResponse>({
    queryKey: ["admin", "notifications", { status, page }],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), pageSize: "20" });
      if (status) params.set("status", status);
      const response = await fetch(`/api/v1/admin/notifications?${params}`);
      if (!response.ok) throw new Error("Failed to fetch notifications");
      return response.json();
    },
  });

  const markReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await fetch(`/api/v1/admin/notifications/${notificationId}/read`, {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to mark as read");
      return response.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "notifications"] }),
  });

  const notifications = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label htmlFor="notif-status" className="mb-1.5 block text-sm font-medium text-brand-graphite">Статус</label>
          <select
            id="notif-status"
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
              <th scope="col" className="px-4 py-3">Заголовок</th>
              <th scope="col" className="px-4 py-3">Канал</th>
              <th scope="col" className="px-4 py-3">Статус</th>
              <th scope="col" className="px-4 py-3">Связь</th>
              <th scope="col" className="px-4 py-3">Создано</th>
              <th scope="col" className="px-4 py-3">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {isLoading ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-brand-graphite/50">Загрузка...</td></tr>
            ) : notifications.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-brand-graphite/50">Уведомления не найдены</td></tr>
            ) : notifications.map((n) => (
              <tr key={n.id} className="bg-brand-white">
                <td className="px-4 py-3 font-medium text-brand-graphite">{n.title}</td>
                <td className="px-4 py-3 text-brand-graphite/60">{channelLabels[n.channel] ?? n.channel}</td>
                <td className="px-4 py-3"><Badge tone={statusTone[n.status] ?? "default"}>{statusLabels[n.status] ?? n.status}</Badge></td>
                <td className="px-4 py-3 text-xs text-brand-graphite/50">{n.referenceType ? `${n.referenceType}/${n.referenceId}` : "—"}</td>
                <td className="px-4 py-3 text-brand-graphite/60">{new Date(n.createdAt).toLocaleDateString("ru-RU")}</td>
                <td className="px-4 py-3">
                  {n.status === "PENDING" && (
                    <Button size="sm" variant="secondary" onClick={() => markReadMutation.mutate(n.id)}>
                      Прочитано
                    </Button>
                  )}
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
