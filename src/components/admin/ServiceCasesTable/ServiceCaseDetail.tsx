"use client";

import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface ServiceCaseDetail {
  id: string;
  caseNumber: number;
  type: string;
  severity: string;
  status: string;
  title: string;
  description: string | null;
  contact: { id: string; firstName: string; lastName: string | null; email: string | null; phone: string | null } | null;
  company: { id: string; name: string } | null;
  workOrder: { id: string; workOrderNumber: number; status: string; type: string } | null;
  resolution: string | null;
  cause: string | null;
  resolvedAt: string | null;
  closedAt: string | null;
  createdAt: string;
  logs: { id: string; status: string; note: string | null; actorId: string | null; createdAt: string }[];
}

const STATUS_LABELS: Record<string, string> = {
  NEW: "Новый", TRIAGED: "Рассмотрен", AWAITING_CUSTOMER: "Ожидание клиента",
  PLANNED: "Запланирован", IN_PROGRESS: "В работе", RESOLVED: "Решён",
  CONFIRMED: "Подтверждён", CLOSED: "Закрыт",
};

const VALID_TRANSITIONS: Record<string, string[]> = {
  NEW: ["TRIAGED"], TRIAGED: ["AWAITING_CUSTOMER", "PLANNED"], AWAITING_CUSTOMER: ["TRIAGED", "PLANNED"],
  PLANNED: ["IN_PROGRESS"], IN_PROGRESS: ["RESOLVED"], RESOLVED: ["CONFIRMED"],
  CONFIRMED: ["CLOSED"], CLOSED: [],
};

export function ServiceCaseDetail({ serviceCase }: { serviceCase: ServiceCaseDetail }) {
  const router = useRouter();
  const allowed = VALID_TRANSITIONS[serviceCase.status] ?? [];

  const handleStatusChange = async (newStatus: string) => {
    await fetch(`/api/v1/admin/service-cases/${serviceCase.id}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[--color-7ice-graphite]">
            Обращение #{serviceCase.caseNumber}
          </h1>
          <p className="text-sm text-[--color-7ice-mid-gray]">{serviceCase.title}</p>
        </div>
        <div className="flex gap-2">
          {allowed.map((s) => (
            <Button key={s} variant="secondary" size="sm" onClick={() => handleStatusChange(s)}>
              {STATUS_LABELS[s] ?? s}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-4 space-y-3">
          <h3 className="font-medium text-sm">Детали</h3>
          <div className="text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-[--color-7ice-mid-gray]">Тип</span>
              <span>{serviceCase.type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[--color-7ice-mid-gray]">Важность</span>
              <Badge>{serviceCase.severity}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-[--color-7ice-mid-gray]">Статус</span>
              <Badge>{STATUS_LABELS[serviceCase.status] ?? serviceCase.status}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-[--color-7ice-mid-gray]">Создано</span>
              <span>{new Date(serviceCase.createdAt).toLocaleDateString("ru-RU")}</span>
            </div>
          </div>
        </Card>

        <Card className="p-4 space-y-3">
          <h3 className="font-medium text-sm">Контакт</h3>
          {serviceCase.contact ? (
            <div className="text-sm space-y-1">
              <div>{serviceCase.contact.firstName} {serviceCase.contact.lastName}</div>
              <div className="text-[--color-7ice-mid-gray]">{serviceCase.contact.email}</div>
              {serviceCase.contact.phone && <div>{serviceCase.contact.phone}</div>}
            </div>
          ) : (
            <p className="text-sm text-[--color-7ice-mid-gray]">Не указан</p>
          )}
          {serviceCase.company && (
            <>
              <h3 className="font-medium text-sm pt-2">Компания</h3>
              <p className="text-sm">{serviceCase.company.name}</p>
            </>
          )}
        </Card>
      </div>

      {serviceCase.description && (
        <Card className="p-4">
          <h3 className="font-medium text-sm mb-2">Описание</h3>
          <p className="text-sm text-[--color-7ice-dark-gray] whitespace-pre-wrap">{serviceCase.description}</p>
        </Card>
      )}

      {serviceCase.workOrder && (
        <Card className="p-4">
          <h3 className="font-medium text-sm mb-2">Связанный заказ</h3>
          <Button variant="ghost" size="sm" onClick={() => router.push(`/admin/orders/${serviceCase.workOrder!.id}`)}>
            Заказ #{serviceCase.workOrder.workOrderNumber} ({serviceCase.workOrder.status})
          </Button>
        </Card>
      )}

      {serviceCase.resolution && (
        <Card className="p-4">
          <h3 className="font-medium text-sm mb-2">Решение</h3>
          <p className="text-sm text-[--color-7ice-dark-gray] whitespace-pre-wrap">{serviceCase.resolution}</p>
        </Card>
      )}

      <Card className="p-4">
        <h3 className="font-medium text-sm mb-3">История</h3>
        {serviceCase.logs.length === 0 ? (
          <p className="text-sm text-[--color-7ice-mid-gray]">Нет записей</p>
        ) : (
          <div className="space-y-2">
            {serviceCase.logs.map((log) => (
              <div key={log.id} className="flex items-start gap-3 text-sm border-b border-[--color-7ice-border] pb-2 last:border-0">
                <Badge tone="default">{STATUS_LABELS[log.status] ?? log.status}</Badge>
                {log.note && <span className="text-[--color-7ice-dark-gray]">{log.note}</span>}
                <span className="ml-auto text-xs text-[--color-7ice-mid-gray] whitespace-nowrap">
                  {new Date(log.createdAt).toLocaleString("ru-RU")}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
