"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import type { Route } from "next";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface EmployeeDashboard {
  stats: {
    assignedOrders: number;
    pendingOrders: number;
    myCompletedOrders: number;
    totalContacts: number;
    totalDeals: number;
  };
  todayOrders: {
    id: string;
    number: number;
    type: string;
    status: string;
    title: string;
    contactName: string | null;
    companyName: string | null;
    scheduledAt: string | null;
    siteAddress: string | null;
  }[];
  recentOrders: {
    id: string;
    number: number;
    type: string;
    status: string;
    title: string;
    contactName: string | null;
    companyName: string | null;
    scheduledAt: string | null;
    createdAt: string;
  }[];
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
  COMPLETED: [],
  CANCELLED: [],
};

function Card({ title, value, href }: { title: string; value: string | number; href?: string }) {
  const content = (
    <div className="rounded-card border border-border-subtle bg-brand-white p-6">
      <p className="text-sm text-brand-graphite/60">{title}</p>
      <p className="mt-2 text-3xl font-bold text-brand-graphite">{value}</p>
    </div>
  );

  if (href) {
    return <Link href={href as Route}>{content}</Link>;
  }
  return content;
}

export default function EmployeePage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<{ data: EmployeeDashboard }>({
    queryKey: ["employee", "dashboard"],
    queryFn: async () => {
      const response = await fetch("/api/v1/employee/dashboard");
      if (!response.ok) throw new Error("Failed to fetch employee data");
      return response.json();
    },
  });

  const statusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const response = await fetch(`/api/v1/employee/orders/${orderId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error("Failed to update status");
      return response.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["employee", "dashboard"] }),
  });

  if (isLoading || !data) {
    return <div className="py-8 text-center text-brand-graphite/50">Загрузка...</div>;
  }

  const d = data.data;

  return (
    <div className="min-h-screen bg-surface-muted">
      <header className="border-b border-border-subtle bg-brand-white">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-6">
          <span className="text-lg font-bold text-brand-graphite">7ice Рабочее место</span>
          <Link className="text-sm font-medium text-brand-blue hover:opacity-80" href={"/" as Route}>
            На сайт
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-8 px-6 py-8">
        <h1 className="text-2xl font-bold text-brand-graphite">Мои задачи</h1>

        <section className="grid grid-cols-2 gap-4 md:grid-cols-5">
          <Card title="Назначены" value={d.stats.assignedOrders} />
          <Card title="Ожидают" value={d.stats.pendingOrders} />
          <Card title="Завершены мной" value={d.stats.myCompletedOrders} />
          <Card title="Контакты" value={d.stats.totalContacts} />
          <Card title="Сделки" value={d.stats.totalDeals} />
        </section>

        {d.todayOrders.length > 0 ? (
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-brand-graphite">Сегодня</h2>
            <div className="space-y-3">
              {d.todayOrders.map((o) => (
                <div key={o.id} className="flex items-center justify-between rounded-card border border-border-subtle bg-brand-white px-4 py-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-brand-graphite">#{o.number}</span>
                      <Badge tone={statusTone[o.status] ?? "default"}>{statusLabels[o.status] ?? o.status}</Badge>
                      <Badge tone="info">{typeLabels[o.type] ?? o.type}</Badge>
                    </div>
                    <p className="text-sm text-brand-graphite">{o.title}</p>
                    <p className="text-xs text-brand-graphite/50">
                      {o.contactName ? `Клиент: ${o.contactName}` : ""}
                      {o.companyName ? ` (${o.companyName})` : ""}
                      {o.siteAddress ? ` — ${o.siteAddress}` : ""}
                    </p>
                  </div>
                  {o.scheduledAt && (
                    <span className="text-sm text-brand-graphite/60">
                      {new Date(o.scheduledAt).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  )}
                  {(VALID_TRANSITIONS[o.status] ?? []).length > 0 ? (
                    <div className="flex gap-1">
                      {(VALID_TRANSITIONS[o.status] ?? []).slice(0, 2).map((s) => (
                        <Button
                          key={s}
                          size="sm"
                          variant="secondary"
                          onClick={() => statusMutation.mutate({ orderId: o.id, status: s })}
                          disabled={statusMutation.isPending}
                        >
                          {statusLabels[s] ?? s}
                        </Button>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-brand-graphite">Мои заказы</h2>
          <div className="overflow-hidden rounded-card border border-border-subtle">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-muted text-xs uppercase tracking-wide text-brand-graphite/60">
                <tr>
                  <th className="px-4 py-3">№</th>
                  <th className="px-4 py-3">Название</th>
                  <th className="px-4 py-3">Тип</th>
                  <th className="px-4 py-3">Статус</th>
                  <th className="px-4 py-3">Клиент</th>
                  <th className="px-4 py-3">Дата</th>
                  <th className="px-4 py-3">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {d.recentOrders.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-brand-graphite/50">Заказов пока нет</td></tr>
                ) : d.recentOrders.map((o) => (
                  <tr key={o.id} className="bg-brand-white">
                    <td className="px-4 py-3 font-medium text-brand-graphite">#{o.number}</td>
                    <td className="px-4 py-3 text-brand-graphite">{o.title}</td>
                    <td className="px-4 py-3 text-brand-graphite/60">{typeLabels[o.type] ?? o.type}</td>
                    <td className="px-4 py-3"><Badge tone={statusTone[o.status] ?? "default"}>{statusLabels[o.status] ?? o.status}</Badge></td>
                    <td className="px-4 py-3 text-brand-graphite/60">{o.contactName ?? "—"}</td>
                    <td className="px-4 py-3 text-brand-graphite/60">
                      {o.scheduledAt ? new Date(o.scheduledAt).toLocaleDateString("ru-RU") : new Date(o.createdAt).toLocaleDateString("ru-RU")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {(VALID_TRANSITIONS[o.status] ?? []).slice(0, 2).map((s) => (
                          <Button
                            key={s}
                            size="sm"
                            variant="secondary"
                            onClick={() => statusMutation.mutate({ orderId: o.id, status: s })}
                            disabled={statusMutation.isPending}
                          >
                            {statusLabels[s] ?? s}
                          </Button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
