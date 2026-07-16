"use client";

import { useQuery } from "@tanstack/react-query";

import { Badge } from "@/components/ui/badge";

interface DashboardData {
  commercial: {
    contacts: number;
    companies: number;
    deals: number;
    dealsByStage: { stage: string; count: number }[];
  };
  finance: {
    invoices: number;
    invoicesByStatus: { status: string; count: number }[];
    totalRevenueCents: number;
    paidRevenueCents: number;
  };
  delivery: {
    workOrders: number;
    workOrdersByStatus: { status: string; count: number }[];
  };
  recentActivity: {
    contacts: { id: string; label: string; createdAt: string }[];
    deals: { id: string; label: string; stage: string; createdAt: string }[];
    invoices: { id: string; number: number; status: string; amountCents: number; createdAt: string }[];
  };
}

const stageLabels: Record<string, string> = {
  NEW: "Новый",
  QUALIFIED: "Квалификация",
  PROPOSAL: "Предложение",
  NEGOTIATION: "Переговоры",
  WON: "Выигран",
  LOST: "Проигран",
};

const statusLabels: Record<string, string> = {
  DRAFT: "Черновик",
  ISSUED: "Выставлен",
  PAID: "Оплачен",
  OVERDUE: "Просрочен",
  CANCELLED: "Отменён",
  PLANNED: "Запланирован",
  SCHEDULED: "Назначен",
  IN_PROGRESS: "В работе",
  ON_HOLD: "Приостановлен",
  QUALITY_REVIEW: "Проверка",
  COMPLETED: "Завершён",
};

function formatCents(cents: number): string {
  return (cents / 100).toLocaleString("ru-RU", { style: "currency", currency: "RUB" });
}

function Card({ title, value, subtitle }: { title: string; value: string | number; subtitle?: string }) {
  return (
    <div className="rounded-card border border-border-subtle bg-brand-white p-6">
      <p className="text-sm text-brand-graphite/60">{title}</p>
      <p className="mt-2 text-3xl font-bold text-brand-graphite">{value}</p>
      {subtitle ? <p className="mt-1 text-xs text-brand-graphite/50">{subtitle}</p> : null}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-brand-graphite">{title}</h2>
      {children}
    </div>
  );
}

export default function AdminAnalyticsPage() {
  const { data, isLoading } = useQuery<{ data: DashboardData }>({
    queryKey: ["admin", "analytics", "dashboard"],
    queryFn: async () => {
      const response = await fetch("/api/v1/admin/analytics/dashboard");
      if (!response.ok) throw new Error("Failed to fetch analytics");
      return response.json();
    },
  });

  if (isLoading || !data) {
    return <div className="py-8 text-center text-brand-graphite/50">Загрузка...</div>;
  }

  const d = data.data;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-brand-graphite">Аналитика</h1>
        <p className="mt-2 text-sm text-brand-graphite/70">
          Обзор ключевых метрик платформы.
        </p>
      </div>

      <Section title="Коммерция">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Card title="Контакты" value={d.commercial.contacts} />
          <Card title="Компании" value={d.commercial.companies} />
          <Card title="Сделки" value={d.commercial.deals} />
          <Card title="Выиграно" value={d.commercial.dealsByStage.find((s) => s.stage === "WON")?.count ?? 0} />
        </div>
        <div className="flex flex-wrap gap-2">
          {d.commercial.dealsByStage.map((s) => (
            <Badge key={s.stage} tone={s.stage === "WON" ? "success" : s.stage === "LOST" ? "default" : "info"}>
              {stageLabels[s.stage] ?? s.stage}: {s.count}
            </Badge>
          ))}
        </div>
      </Section>

      <Section title="Финансы">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Card title="Счета" value={d.finance.invoices} />
          <Card title="Выручка" value={formatCents(d.finance.totalRevenueCents)} />
          <Card title="Оплачено" value={formatCents(d.finance.paidRevenueCents)} />
          <Card title="К взысканию" value={formatCents(d.finance.totalRevenueCents - d.finance.paidRevenueCents)} />
        </div>
        <div className="flex flex-wrap gap-2">
          {d.finance.invoicesByStatus.map((s) => (
            <Badge key={s.status} tone={s.status === "PAID" ? "success" : s.status === "OVERDUE" ? "warning" : "info"}>
              {statusLabels[s.status] ?? s.status}: {s.count}
            </Badge>
          ))}
        </div>
      </Section>

      <Section title="Доставка">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Card title="Заказы" value={d.delivery.workOrders} />
          <Card title="В работе" value={d.delivery.workOrdersByStatus.find((s) => s.status === "IN_PROGRESS")?.count ?? 0} />
          <Card title="Завершены" value={d.delivery.workOrdersByStatus.find((s) => s.status === "COMPLETED")?.count ?? 0} />
          <Card title="Ожидают" value={d.delivery.workOrdersByStatus.find((s) => s.status === "SCHEDULED")?.count ?? 0} />
        </div>
        <div className="flex flex-wrap gap-2">
          {d.delivery.workOrdersByStatus.map((s) => (
            <Badge key={s.status} tone={s.status === "COMPLETED" ? "success" : s.status === "IN_PROGRESS" ? "warning" : "info"}>
              {statusLabels[s.status] ?? s.status}: {s.count}
            </Badge>
          ))}
        </div>
      </Section>

      <Section title="Последняя активность">
        <div className="grid gap-6 md:grid-cols-3">
          <div>
            <h3 className="mb-3 text-sm font-medium text-brand-graphite/60">Контакты</h3>
            <div className="space-y-2">
              {d.recentActivity.contacts.map((c) => (
                <div key={c.id} className="flex items-center justify-between rounded-card bg-brand-white px-3 py-2 text-sm">
                  <span className="text-brand-graphite">{c.label}</span>
                  <span className="text-xs text-brand-graphite/50">{new Date(c.createdAt).toLocaleDateString("ru-RU")}</span>
                </div>
              ))}
              {d.recentActivity.contacts.length === 0 && <p className="text-xs text-brand-graphite/40">Нет данных</p>}
            </div>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-medium text-brand-graphite/60">Сделки</h3>
            <div className="space-y-2">
              {d.recentActivity.deals.map((deal) => (
                <div key={deal.id} className="flex items-center justify-between rounded-card bg-brand-white px-3 py-2 text-sm">
                  <span className="text-brand-graphite">{deal.label}</span>
                  <Badge tone="info">{stageLabels[deal.stage] ?? deal.stage}</Badge>
                </div>
              ))}
              {d.recentActivity.deals.length === 0 && <p className="text-xs text-brand-graphite/40">Нет данных</p>}
            </div>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-medium text-brand-graphite/60">Счета</h3>
            <div className="space-y-2">
              {d.recentActivity.invoices.map((inv) => (
                <div key={inv.id} className="flex items-center justify-between rounded-card bg-brand-white px-3 py-2 text-sm">
                  <span className="text-brand-graphite">#{inv.number}</span>
                  <Badge tone={inv.status === "PAID" ? "success" : "info"}>{formatCents(inv.amountCents)}</Badge>
                </div>
              ))}
              {d.recentActivity.invoices.length === 0 && <p className="text-xs text-brand-graphite/40">Нет данных</p>}
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}
