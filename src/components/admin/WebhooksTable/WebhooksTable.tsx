"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  status: string;
  integrationName: string | null;
  deliveryCount: number;
  createdAt: string;
}

const statusLabels: Record<string, string> = {
  ACTIVE: "Активен",
  INACTIVE: "Неактивен",
  ERROR: "Ошибка",
};

const statusTone: Record<string, "default" | "info" | "success" | "warning"> = {
  ACTIVE: "success",
  INACTIVE: "default",
  ERROR: "warning",
};

const eventLabels: Record<string, string> = {
  CONTACT_CREATED: "Контакт создан",
  CONTACT_UPDATED: "Контакт обновлён",
  DEAL_CREATED: "Сделка создана",
  DEAL_STAGE_CHANGED: "Стадия сделки",
  INVOICE_ISSUED: "Счёт выставлен",
  INVOICE_PAID: "Счёт оплачен",
  WORK_ORDER_CREATED: "Заказ создан",
  WORK_ORDER_COMPLETED: "Заказ завершён",
  PAYMENT_RECEIVED: "Платёж получен",
};

interface TestResult {
  deliveryId: string;
  status: string;
  responseCode: number;
  error: string | null;
}

export function WebhooksTable() {
  const [testResults, setTestResults] = useState<Record<string, TestResult>>({});

  const { data, isLoading } = useQuery<{ data: Webhook[] }>({
    queryKey: ["admin", "webhooks"],
    queryFn: async () => {
      const response = await fetch("/api/v1/admin/webhooks");
      if (!response.ok) throw new Error("Failed to fetch webhooks");
      return response.json();
    },
  });

  const testMutation = useMutation({
    mutationFn: async ({ webhookId, event }: { webhookId: string; event: string }) => {
      const response = await fetch(`/api/v1/admin/webhooks/${webhookId}/test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event }),
      });
      if (!response.ok) throw new Error("Test failed");
      return response.json() as Promise<{ data: TestResult }>;
    },
    onSuccess: (result, variables) => {
      setTestResults((prev) => ({ ...prev, [variables.webhookId]: result.data }));
    },
  });

  const webhooks = data?.data ?? [];

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-card border border-border-subtle">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-muted text-xs uppercase tracking-wide text-brand-graphite/60">
            <tr>
              <th scope="col" className="px-4 py-3">Название</th>
              <th scope="col" className="px-4 py-3">URL</th>
              <th scope="col" className="px-4 py-3">Статус</th>
              <th scope="col" className="px-4 py-3">Интеграция</th>
              <th scope="col" className="px-4 py-3">События</th>
              <th scope="col" className="px-4 py-3">Доставок</th>
              <th scope="col" className="px-4 py-3">Тест</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {isLoading ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-brand-graphite/50">Загрузка...</td></tr>
            ) : webhooks.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-brand-graphite/50">Вебхуки не найдены</td></tr>
            ) : webhooks.map((w) => (
              <tr key={w.id} className="bg-brand-white">
                <td className="px-4 py-3 font-medium text-brand-graphite">{w.name}</td>
                <td className="px-4 py-3 text-xs text-brand-graphite/50 max-w-[200px] truncate">{w.url}</td>
                <td className="px-4 py-3"><Badge tone={statusTone[w.status] ?? "default"}>{statusLabels[w.status] ?? w.status}</Badge></td>
                <td className="px-4 py-3 text-brand-graphite/60">{w.integrationName ?? "—"}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {w.events.slice(0, 3).map((e) => (
                      <Badge key={e} tone="info">{eventLabels[e] ?? e}</Badge>
                    ))}
                    {w.events.length > 3 && <Badge tone="default">+{w.events.length - 3}</Badge>}
                  </div>
                </td>
                <td className="px-4 py-3 text-brand-graphite/60">{w.deliveryCount}</td>
                <td className="px-4 py-3">
                  {w.events.length > 0 ? (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => testMutation.mutate({ webhookId: w.id, event: w.events[0] })}
                      disabled={testMutation.isPending}
                    >
                      Тест
                    </Button>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {Object.entries(testResults).map(([webhookId, result]) => (
        <div key={webhookId} className="rounded-card border border-border-subtle bg-brand-white p-4 text-sm">
          <div className="flex items-center gap-3">
            <span className="font-medium text-brand-graphite">Результат теста:</span>
            <Badge tone={result.status === "SUCCESS" ? "success" : "warning"}>
              {result.status} {result.responseCode ? `(${result.responseCode})` : ""}
            </Badge>
            {result.error && <span className="text-brand-graphite/50">{result.error}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}
