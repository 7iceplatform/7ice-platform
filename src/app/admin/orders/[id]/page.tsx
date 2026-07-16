"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface WorkOrderDetail {
  id: string;
  workOrderNumber: number;
  type: string;
  status: string;
  title: string;
  description: string | null;
  contactName: string | null;
  companyName: string | null;
  technicianName: string | null;
  scheduledAt: string | null;
  estimatedEndAt: string | null;
  completedAt: string | null;
  siteAddress: string | null;
  createdAt: string;
  updatedAt: string;
  logs: {
    id: string;
    status: string;
    note: string | null;
    actorId: string | null;
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
};

export default function WorkOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const orderId = params.id as string;

  const { data, isLoading } = useQuery<{ data: WorkOrderDetail }>({
    queryKey: ["admin", "orders", orderId],
    queryFn: async () => {
      const response = await fetch(`/api/v1/admin/orders/${orderId}`);
      if (!response.ok) throw new Error("Failed to fetch order");
      return response.json();
    },
  });

  const transitionMutation = useMutation({
    mutationFn: async (newStatus: string) => {
      const response = await fetch(`/api/v1/admin/orders/${orderId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) throw new Error("Failed to transition");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "orders", orderId] });
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
    },
  });

  if (isLoading || !data) {
    return <div className="py-8 text-center text-brand-graphite/50">Загрузка...</div>;
  }

  const order = data.data;
  const transitions = VALID_TRANSITIONS[order.status] ?? [];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-brand-graphite">Заказ #{order.workOrderNumber}</h1>
            <Badge tone={statusTone[order.status] ?? "default"}>{statusLabels[order.status] ?? order.status}</Badge>
            <Badge tone="info">{typeLabels[order.type] ?? order.type}</Badge>
          </div>
          <p className="mt-1 text-sm text-brand-graphite/60">{order.title}</p>
        </div>
        <Button variant="secondary" onClick={() => router.back()}>Назад</Button>
      </div>

      <div className="rounded-card border border-border-subtle bg-brand-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-brand-graphite">Информация</h2>
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-brand-graphite/50">Контакт</dt>
            <dd className="mt-1 text-brand-graphite">{order.contactName ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-brand-graphite/50">Компания</dt>
            <dd className="mt-1 text-brand-graphite">{order.companyName ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-brand-graphite/50">Техник</dt>
            <dd className="mt-1 text-brand-graphite">{order.technicianName ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-brand-graphite/50">Адрес</dt>
            <dd className="mt-1 text-brand-graphite">{order.siteAddress ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-brand-graphite/50">Дата начала</dt>
            <dd className="mt-1 text-brand-graphite">
              {order.scheduledAt ? new Date(order.scheduledAt).toLocaleString("ru-RU") : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-brand-graphite/50">Дата окончания</dt>
            <dd className="mt-1 text-brand-graphite">
              {order.estimatedEndAt ? new Date(order.estimatedEndAt).toLocaleString("ru-RU") : "—"}
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
        <h2 className="mb-4 text-lg font-semibold text-brand-graphite">История</h2>
        {order.logs.length === 0 ? (
          <p className="text-sm text-brand-graphite/50">Нет записей</p>
        ) : (
          <div className="space-y-3">
            {order.logs.map((log) => (
              <div key={log.id} className="flex items-start gap-3 text-sm">
                <Badge tone={statusTone[log.status] ?? "default"}>{statusLabels[log.status] ?? log.status}</Badge>
                <div className="flex-1">
                  {log.note ? <p className="text-brand-graphite">{log.note}</p> : null}
                  <p className="mt-1 text-xs text-brand-graphite/40">
                    {new Date(log.createdAt).toLocaleString("ru-RU")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
