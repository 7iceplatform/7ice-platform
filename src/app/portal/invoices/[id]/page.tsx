"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import Link from "next/link";
import type { Route } from "next";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface InvoiceDetail {
  id: string;
  number: number;
  status: string;
  amountCents: number;
  taxCents: number;
  totalCents: number;
  currency: string;
  description: string | null;
  contactName: string | null;
  companyName: string | null;
  issuedAt: string | null;
  dueAt: string | null;
  paidAt: string | null;
  createdAt: string;
  payments: {
    id: string;
    amountCents: number;
    method: string;
    status: string;
    reference: string | null;
    settledAt: string | null;
  }[];
}

const statusLabels: Record<string, string> = {
  DRAFT: "Черновик",
  ISSUED: "Выставлен",
  PAID: "Оплачен",
  OVERDUE: "Просрочен",
  CANCELLED: "Отменён",
};

const statusTone: Record<string, "default" | "info" | "success" | "warning"> = {
  DRAFT: "default",
  ISSUED: "info",
  PAID: "success",
  OVERDUE: "warning",
  CANCELLED: "default",
};

const methodLabels: Record<string, string> = {
  CARD: "Карта",
  BANK_TRANSFER: "Перевод",
  CASH: "Наличные",
  ONLINE: "Онлайн",
  OTHER: "Другое",
};

function formatCents(cents: number): string {
  return (cents / 100).toLocaleString("ru-RU", { style: "currency", currency: "RUB" });
}

export default function PortalInvoiceDetailPage() {
  const params = useParams();
  const invoiceId = params.id as string;

  const { data, isLoading } = useQuery<{ data: InvoiceDetail }>({
    queryKey: ["portal", "invoices", invoiceId],
    queryFn: async () => {
      const response = await fetch(`/api/v1/portal/invoices/${invoiceId}`);
      if (!response.ok) throw new Error("Failed to fetch invoice");
      return response.json();
    },
  });

  if (isLoading || !data) {
    return <div className="py-8 text-center text-brand-graphite/50">Загрузка...</div>;
  }

  const invoice = data.data;

  return (
    <div className="min-h-screen bg-surface-muted">
      <header className="border-b border-border-subtle bg-brand-white">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-6">
          <span className="text-lg font-bold text-brand-graphite">7ice Кабинет</span>
          <div className="flex gap-4">
            <Link className="text-sm font-medium text-brand-graphite/60 hover:text-brand-graphite" href={"/portal" as Route}>Главная</Link>
            <Link className="text-sm font-medium text-brand-graphite/60 hover:text-brand-graphite" href={"/portal/orders" as Route}>Заказы</Link>
            <Link className="text-sm font-medium text-brand-blue hover:opacity-80" href={"/portal/invoices" as Route}>Счета</Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-6 px-6 py-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-brand-graphite">Счёт #{invoice.number}</h1>
            <Badge tone={statusTone[invoice.status] ?? "default"}>{statusLabels[invoice.status] ?? invoice.status}</Badge>
          </div>
          <Link href={"/portal/invoices" as Route}>
            <Button variant="secondary">Назад</Button>
          </Link>
        </div>

        <div className="rounded-card border border-border-subtle bg-brand-white p-6">
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-brand-graphite/50">Сумма</dt>
              <dd className="mt-1 text-brand-graphite">{formatCents(invoice.amountCents)}</dd>
            </div>
            <div>
              <dt className="text-brand-graphite/50">Налог</dt>
              <dd className="mt-1 text-brand-graphite">{formatCents(invoice.taxCents)}</dd>
            </div>
            <div>
              <dt className="text-brand-graphite/50">Итого</dt>
              <dd className="mt-1 text-lg font-bold text-brand-graphite">{formatCents(invoice.totalCents)}</dd>
            </div>
            <div>
              <dt className="text-brand-graphite/50">Срок оплаты</dt>
              <dd className="mt-1 text-brand-graphite">
                {invoice.dueAt ? new Date(invoice.dueAt).toLocaleDateString("ru-RU") : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-brand-graphite/50">Выставлен</dt>
              <dd className="mt-1 text-brand-graphite">
                {invoice.issuedAt ? new Date(invoice.issuedAt).toLocaleString("ru-RU") : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-brand-graphite/50">Оплачен</dt>
              <dd className="mt-1 text-brand-graphite">
                {invoice.paidAt ? new Date(invoice.paidAt).toLocaleString("ru-RU") : "—"}
              </dd>
            </div>
            {invoice.description ? (
              <div className="col-span-2">
                <dt className="text-brand-graphite/50">Описание</dt>
                <dd className="mt-1 text-brand-graphite">{invoice.description}</dd>
              </div>
            ) : null}
          </dl>
        </div>

        {invoice.payments.length > 0 ? (
          <div className="rounded-card border border-border-subtle bg-brand-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-brand-graphite">Платежи</h2>
            <div className="overflow-hidden rounded-card border border-border-subtle">
              <table className="w-full text-left text-sm">
                <thead className="bg-surface-muted text-xs uppercase tracking-wide text-brand-graphite/60">
                  <tr>
                    <th className="px-4 py-3">Сумма</th>
                    <th className="px-4 py-3">Способ</th>
                    <th className="px-4 py-3">Статус</th>
                    <th className="px-4 py-3">Дата</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {invoice.payments.map((p) => (
                    <tr key={p.id} className="bg-brand-white">
                      <td className="px-4 py-3 font-medium text-brand-graphite">{formatCents(p.amountCents)}</td>
                      <td className="px-4 py-3 text-brand-graphite/60">{methodLabels[p.method] ?? p.method}</td>
                      <td className="px-4 py-3">
                        <Badge tone={p.status === "SETTLED" ? "success" : "info"}>{p.status}</Badge>
                      </td>
                      <td className="px-4 py-3 text-brand-graphite/60">
                        {p.settledAt ? new Date(p.settledAt).toLocaleDateString("ru-RU") : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}
