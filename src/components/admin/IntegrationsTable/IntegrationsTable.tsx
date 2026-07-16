"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Integration {
  id: string;
  name: string;
  type: string;
  status: string;
  description: string | null;
  endpointUrl: string | null;
  lastSyncAt: string | null;
  lastErrorAt: string | null;
  lastError: string | null;
  logCount: number;
  webhookCount: number;
  createdAt: string;
}

const typeLabels: Record<string, string> = {
  API_KEY: "API ключ",
  WEBHOOK: "Вебхук",
  OAUTH2: "OAuth2",
  SYNC: "Синхронизация",
};

const statusLabels: Record<string, string> = {
  ACTIVE: "Активна",
  INACTIVE: "Неактивна",
  ERROR: "Ошибка",
  PENDING: "Ожидание",
};

const statusTone: Record<string, "default" | "info" | "success" | "warning"> = {
  ACTIVE: "success",
  INACTIVE: "default",
  ERROR: "warning",
  PENDING: "info",
};

export function IntegrationsTable() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<{ data: Integration[] }>({
    queryKey: ["admin", "integrations"],
    queryFn: async () => {
      const response = await fetch("/api/v1/admin/integrations");
      if (!response.ok) throw new Error("Failed to fetch integrations");
      return response.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (integrationId: string) => {
      const response = await fetch(`/api/v1/admin/integrations/${integrationId}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete");
      return response.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "integrations"] }),
  });

  const integrations = data?.data ?? [];

  return (
    <div className="overflow-hidden rounded-card border border-border-subtle">
      <table className="w-full text-left text-sm">
        <thead className="bg-surface-muted text-xs uppercase tracking-wide text-brand-graphite/60">
          <tr>
            <th scope="col" className="px-4 py-3">Название</th>
            <th scope="col" className="px-4 py-3">Тип</th>
            <th scope="col" className="px-4 py-3">Статус</th>
            <th scope="col" className="px-4 py-3">Endpoint</th>
            <th scope="col" className="px-4 py-3">Логи</th>
            <th scope="col" className="px-4 py-3">Вебхуки</th>
            <th scope="col" className="px-4 py-3">Последняя синхр.</th>
            <th scope="col" className="px-4 py-3">Действия</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border-subtle">
          {isLoading ? (
            <tr><td colSpan={8} className="px-4 py-8 text-center text-brand-graphite/50">Загрузка...</td></tr>
          ) : integrations.length === 0 ? (
            <tr><td colSpan={8} className="px-4 py-8 text-center text-brand-graphite/50">Интеграции не найдены</td></tr>
          ) : integrations.map((i) => (
            <tr key={i.id} className="bg-brand-white">
              <td className="px-4 py-3 font-medium text-brand-graphite">{i.name}</td>
              <td className="px-4 py-3 text-brand-graphite/60">{typeLabels[i.type] ?? i.type}</td>
              <td className="px-4 py-3"><Badge tone={statusTone[i.status] ?? "default"}>{statusLabels[i.status] ?? i.status}</Badge></td>
              <td className="px-4 py-3 text-xs text-brand-graphite/50 max-w-[200px] truncate">{i.endpointUrl ?? "—"}</td>
              <td className="px-4 py-3 text-brand-graphite/60">{i.logCount}</td>
              <td className="px-4 py-3 text-brand-graphite/60">{i.webhookCount}</td>
              <td className="px-4 py-3 text-brand-graphite/60">
                {i.lastSyncAt ? new Date(i.lastSyncAt).toLocaleDateString("ru-RU") : "—"}
              </td>
              <td className="px-4 py-3">
                <Button size="sm" variant="secondary" onClick={() => deleteMutation.mutate(i.id)}>
                  Удалить
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
