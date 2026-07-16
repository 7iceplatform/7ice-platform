"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import Link from "next/link";
import type { Route } from "next";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface OrderDetail {
  id: string;
  number: number;
  type: string;
  status: string;
  title: string;
  description: string | null;
  contactName: string | null;
  companyName: string | null;
  siteAddress: string | null;
  scheduledAt: string | null;
  completedAt: string | null;
  createdAt: string;
  logs: { status: string; note: string | null; createdAt: string }[];
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

export default function PortalOrderDetailPage() {
  const params = useParams();
  const orderId = params.id as string;

  const { data, isLoading } = useQuery<{ data: OrderDetail }>({
    queryKey: ["portal", "orders", orderId],
    queryFn: async () => {
      const response = await fetch(`/api/v1/portal/orders/${orderId}`);
      if (!response.ok) throw new Error("Failed to fetch order");
      return response.json();
    },
  });

  if (isLoading || !data) {
    return <div className="py-8 text-center text-brand-graphite/50">Загрузка...</div>;
  }

  const order = data.data;

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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-brand-graphite">Заказ #{order.number}</h1>
            <Badge tone={statusTone[order.status] ?? "default"}>{statusLabels[order.status] ?? order.status}</Badge>
          </div>
          <Link href={"/portal/orders" as Route}>
            <Button variant="secondary">Назад</Button>
          </Link>
        </div>

        <div className="rounded-card border border-border-subtle bg-brand-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-brand-graphite">{order.title}</h2>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-brand-graphite/50">Тип</dt>
              <dd className="mt-1 text-brand-graphite">{typeLabels[order.type] ?? order.type}</dd>
            </div>
            <div>
              <dt className="text-brand-graphite/50">Адрес</dt>
              <dd className="mt-1 text-brand-graphite">{order.siteAddress ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-brand-graphite/50">Запланировано</dt>
              <dd className="mt-1 text-brand-graphite">
                {order.scheduledAt ? new Date(order.scheduledAt).toLocaleString("ru-RU") : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-brand-graphite/50">Завершено</dt>
              <dd className="mt-1 text-brand-graphite">
                {order.completedAt ? new Date(order.completedAt).toLocaleString("ru-RU") : "—"}
              </dd>
            </div>
            {order.description ? (
              <div className="col-span-2">
                <dt className="text-brand-graphite/50">Описание</dt>
                <dd className="mt-1 text-brand-graphite">{order.description}</dd>
              </div>
            ) : null}
          </dl>
        </div>

        {order.logs.length > 0 ? (
          <div className="rounded-card border border-border-subtle bg-brand-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-brand-graphite">История</h2>
            <div className="space-y-3">
              {order.logs.map((log, i) => (
                <div key={i} className="flex items-start gap-3 text-sm">
                  <span className="text-brand-graphite/40">{new Date(log.createdAt).toLocaleString("ru-RU")}</span>
                  <Badge tone="default">{statusLabels[log.status] ?? log.status}</Badge>
                  {log.note ? <span className="text-brand-graphite/60">{log.note}</span> : null}
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}
