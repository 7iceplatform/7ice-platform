"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { TextInput } from "@/components/ui/text-input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface AuditActor {
  id: string;
  email: string | null;
  displayName: string | null;
}

interface AuditRecord {
  id: string;
  action: string;
  resourceType: string;
  resourceId: string | null;
  requestId: string | null;
  metadata: Record<string, unknown> | null;
  occurredAt: string;
  actor: AuditActor | null;
}

interface AuditResponse {
  data: AuditRecord[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function AuditTable() {
  const [action, setAction] = useState("");
  const [resourceType, setResourceType] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery<AuditResponse>({
    queryKey: ["admin", "audit", { action, resourceType, page }],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), pageSize: "20" });
      if (action) params.set("action", action);
      if (resourceType) params.set("resourceType", resourceType);

      const response = await fetch(`/api/v1/admin/audit?${params}`);
      if (!response.ok) throw new Error("Failed to fetch audit records");
      return response.json();
    },
  });

  const records = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex-1">
          <label htmlFor="audit-action" className="mb-1.5 block text-sm font-medium text-brand-graphite">
            Действие
          </label>
          <TextInput
            id="audit-action"
            placeholder="role.assigned, user.created..."
            value={action}
            onChange={(e) => {
              setAction(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div className="flex-1">
          <label htmlFor="audit-resource" className="mb-1.5 block text-sm font-medium text-brand-graphite">
            Тип ресурса
          </label>
          <TextInput
            id="audit-resource"
            placeholder="user, role..."
            value={resourceType}
            onChange={(e) => {
              setResourceType(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-card border border-border-subtle">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-muted text-xs uppercase tracking-wide text-brand-graphite/60">
            <tr>
              <th scope="col" className="px-4 py-3">Дата</th>
              <th scope="col" className="px-4 py-3">Действие</th>
              <th scope="col" className="px-4 py-3">Ресурс</th>
              <th scope="col" className="px-4 py-3">Актор</th>
              <th scope="col" className="px-4 py-3">Детали</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-brand-graphite/50">
                  Загрузка...
                </td>
              </tr>
            ) : records.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-brand-graphite/50">
                  Записи не найдены
                </td>
              </tr>
            ) : (
              records.map((record) => (
                <tr key={record.id} className="bg-brand-white">
                  <td className="whitespace-nowrap px-4 py-3 text-brand-graphite/70">
                    {formatDate(record.occurredAt)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone="info">{record.action}</Badge>
                  </td>
                  <td className="px-4 py-3 text-brand-graphite/70">
                    {record.resourceType}
                    {record.resourceId ? (
                      <span className="ml-1 text-brand-graphite/40">
                        / {record.resourceId.slice(0, 8)}...
                      </span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-brand-graphite/70">
                    {record.actor?.displayName ?? record.actor?.email ?? "—"}
                  </td>
                  <td className="max-w-[200px] truncate px-4 py-3 font-mono text-xs text-brand-graphite/50">
                    {record.metadata ? JSON.stringify(record.metadata) : "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && pagination.totalPages > 1 ? (
        <div className="flex items-center justify-between text-sm text-brand-graphite/60">
          <span>
            Стр. {pagination.page} из {pagination.totalPages} ({pagination.total} всего)
          </span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Назад
            </Button>
            <Button
              size="sm"
              variant="secondary"
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Далее
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
