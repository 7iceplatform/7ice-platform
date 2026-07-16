"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface InvoiceDetail {
  id: string;
  invoiceNumber: number;
  status: string;
  contactName: string | null;
  companyName: string | null;
  workOrderNumber: number | null;
  amountCents: number;
  taxCents: number;
  totalCents: number;
  currency: string;
  description: string | null;
  issuedAt: string | null;
  dueAt: string | null;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
  payments: {
    id: string;
    amountCents: number;
    method: string;
    status: string;
    reference: string | null;
    settledAt: string | null;
    createdAt: string;
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

const VALID_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ["ISSUED", "CANCELLED"],
  ISSUED: ["PAID", "OVERDUE", "CANCELLED"],
  OVERDUE: ["PAID", "CANCELLED"],
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

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const invoiceId = params.id as string;

  const { data, isLoading } = useQuery<{ data: InvoiceDetail }>({
    queryKey: ["admin", "invoices", invoiceId],
    queryFn: async () => {
      const response = await fetch(`/api/v1/admin/finance/invoices/${invoiceId}`);
      if (!response.ok) throw new Error("Failed to fetch invoice");
      return response.json();
    },
  });

  const transitionMutation = useMutation({
    mutationFn: async (newStatus: string) => {
      const response = await fetch(`/api/v1/admin/finance/invoices/${invoiceId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) throw new Error("Failed to transition");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "invoices", invoiceId] });
      queryClient.invalidateQueries({ queryKey: ["admin", "invoices"] });
    },
  });

  if (isLoading || !data) {
    return <div className="py-8 text-center text-brand-graphite/50">Загрузка...</div>;
  }

  const invoice = data.data;
  const transitions = VALID_TRANSITIONS[invoice.status] ?? [];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-brand-graphite">Счёт #{invoice.invoiceNumber}</h1>
            <Badge tone={statusTone[invoice.status] ?? "default"}>{statusLabels[invoice.status] ?? invoice.status}</Badge>
          </div>
          <p className="mt-1 text-sm text-brand-graphite/60">{formatCents(invoice.totalCents)}</p>
        </div>
        <Button variant="secondary" onClick={() => router.back()}>Назад</Button>
      </div>

      <div className="rounded-card border border-border-subtle bg-brand-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-brand-graphite">Информация</h2>
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-brand-graphite/50">Контакт</dt>
            <dd className="mt-1 text-brand-graphite">{invoice.contactName ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-brand-graphite/50">Компания</dt>
            <dd className="mt-1 text-brand-graphite">{invoice.companyName ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-brand-graphite/50">Заказ</dt>
            <dd className="mt-1 text-brand-graphite">{invoice.workOrderNumber ? `#${invoice.workOrderNumber}` : "—"}</dd>
          </div>
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
            <dt className="text-brand-graphite/50">Выставлен</dt>
            <dd className="mt-1 text-brand-graphite">
              {invoice.issuedAt ? new Date(invoice.issuedAt).toLocaleString("ru-RU") : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-brand-graphite/50">Срок оплаты</dt>
            <dd className="mt-1 text-brand-graphite">
              {invoice.dueAt ? new Date(invoice.dueAt).toLocaleDateString("ru-RU") : "—"}
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

      {transitions.length > 0 ? (
        <div className="rounded-card border border-border-subtle bg-brand-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-brand-graphite">Изменить статус</h2>
          <div className="flex flex-wrap gap-2">
            {transitions.map((s) => (
              <Button
                key={s}
                variant="secondary"
                onClick={() => transitionMutation.mutate(s)}
                disabled={transitionMutation.isPending}
              >
                {statusLabels[s] ?? s}
              </Button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="rounded-card border border-border-subtle bg-brand-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-brand-graphite">Платежи</h2>
        {invoice.payments.length === 0 ? (
          <p className="text-sm text-brand-graphite/50">Платежей пока нет</p>
        ) : (
          <div className="overflow-hidden rounded-card border border-border-subtle">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-muted text-xs uppercase tracking-wide text-brand-graphite/60">
                <tr>
                  <th className="px-4 py-3">Сумма</th>
                  <th className="px-4 py-3">Способ</th>
                  <th className="px-4 py-3">Статус</th>
                  <th className="px-4 py-3">Референс</th>
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
                    <td className="px-4 py-3 text-xs text-brand-graphite/50">{p.reference ?? "—"}</td>
                    <td className="px-4 py-3 text-brand-graphite/60">
                      {p.settledAt ? new Date(p.settledAt).toLocaleDateString("ru-RU") : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
