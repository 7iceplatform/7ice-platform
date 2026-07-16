"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import type { Route } from "next";

import { Badge } from "@/components/ui/badge";

interface PortalDashboard {
  stats: {
    totalOrders: number;
    activeOrders: number;
    completedOrders: number;
    totalInvoices: number;
    unpaidInvoices: number;
  };
  recentOrders: {
    id: string;
    number: number;
    type: string;
    status: string;
    title: string;
    scheduledAt: string | null;
    createdAt: string;
  }[];
  recentInvoices: {
    id: string;
    number: number;
    status: string;
    totalCents: number;
    dueAt: string | null;
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
  ISSUED: "Выставлен",
  PAID: "Оплачен",
  OVERDUE: "Просрочен",
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
  ISSUED: "info",
  PAID: "success",
  OVERDUE: "warning",
};

function formatCents(cents: number): string {
  return (cents / 100).toLocaleString("ru-RU", { style: "currency", currency: "RUB" });
}

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

export default function PortalPage() {
  const { data, isLoading } = useQuery<{ data: PortalDashboard }>({
    queryKey: ["portal", "dashboard"],
    queryFn: async () => {
      const response = await fetch("/api/v1/portal/dashboard");
      if (!response.ok) throw new Error("Failed to fetch portal data");
      return response.json();
    },
  });

  if (isLoading || !data) {
    return <div className="py-8 text-center text-brand-graphite/50">Загрузка...</div>;
  }

  const d = data.data;

  return (
    <div className="min-h-screen bg-surface-muted">
      <header className="border-b border-border-subtle bg-brand-white">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-6">
          <span className="text-lg font-bold text-brand-graphite">7ice Кабинет</span>
          <Link className="text-sm font-medium text-brand-blue hover:opacity-80" href={"/" as Route}>
            На сайт
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-8 px-6 py-8">
        <h1 className="text-2xl font-bold text-brand-graphite">Добро пожаловать</h1>

        <section className="grid grid-cols-2 gap-4 md:grid-cols-5">
          <Card title="Всего заказов" value={d.stats.totalOrders} href="/portal/orders" />
          <Card title="Активные" value={d.stats.activeOrders} href="/portal/orders" />
          <Card title="Завершены" value={d.stats.completedOrders} />
          <Card title="Счета" value={d.stats.totalInvoices} href="/portal/invoices" />
          <Card title="К оплате" value={d.stats.unpaidInvoices} href="/portal/invoices" />
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-brand-graphite">Последние заказы</h2>
          <div className="overflow-hidden rounded-card border border-border-subtle">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-muted text-xs uppercase tracking-wide text-brand-graphite/60">
                <tr>
                  <th className="px-4 py-3">№</th>
                  <th className="px-4 py-3">Название</th>
                  <th className="px-4 py-3">Тип</th>
                  <th className="px-4 py-3">Статус</th>
                  <th className="px-4 py-3">Дата</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {d.recentOrders.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-brand-graphite/50">Заказов пока нет</td></tr>
                ) : d.recentOrders.map((o) => (
                  <tr key={o.id} className="bg-brand-white">
                    <td className="px-4 py-3 font-medium text-brand-graphite">#{o.number}</td>
                    <td className="px-4 py-3 text-brand-graphite">{o.title}</td>
                    <td className="px-4 py-3 text-brand-graphite/60">{typeLabels[o.type] ?? o.type}</td>
                    <td className="px-4 py-3"><Badge tone={statusTone[o.status] ?? "default"}>{statusLabels[o.status] ?? o.status}</Badge></td>
                    <td className="px-4 py-3 text-brand-graphite/60">
                      {o.scheduledAt ? new Date(o.scheduledAt).toLocaleDateString("ru-RU") : new Date(o.createdAt).toLocaleDateString("ru-RU")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-brand-graphite">Последние счета</h2>
          <div className="overflow-hidden rounded-card border border-border-subtle">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-muted text-xs uppercase tracking-wide text-brand-graphite/60">
                <tr>
                  <th className="px-4 py-3">№</th>
                  <th className="px-4 py-3">Статус</th>
                  <th className="px-4 py-3">Сумма</th>
                  <th className="px-4 py-3">Срок</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {d.recentInvoices.length === 0 ? (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-brand-graphite/50">Счетов пока нет</td></tr>
                ) : d.recentInvoices.map((i) => (
                  <tr key={i.id} className="bg-brand-white">
                    <td className="px-4 py-3 font-medium text-brand-graphite">#{i.number}</td>
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
        </section>
      </main>
    </div>
  );
}
