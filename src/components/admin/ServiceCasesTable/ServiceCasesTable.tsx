"use client";

import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ServiceCase {
  id: string;
  caseNumber: number;
  type: string;
  severity: string;
  status: string;
  title: string;
  contact: { id: string; firstName: string; lastName: string } | null;
  company: { id: string; name: string } | null;
  workOrderNumber: number | null;
  createdAt: string;
}

const TYPE_LABELS: Record<string, string> = {
  INCIDENT: "Инцидент",
  REQUEST: "Запрос",
  MAINTENANCE: "Обслуживание",
  WARRANTY: "Гарантия",
  COMPLAINT: "Жалоба",
};

const SEVERITY_TONES: Record<string, "default" | "info" | "warning" | "inverted"> = {
  LOW: "info",
  MEDIUM: "default",
  HIGH: "warning",
  CRITICAL: "inverted",
};

const STATUS_TONES: Record<string, "default" | "info" | "warning" | "inverted"> = {
  NEW: "info",
  TRIAGED: "info",
  AWAITING_CUSTOMER: "warning",
  PLANNED: "default",
  IN_PROGRESS: "default",
  RESOLVED: "inverted",
  CONFIRMED: "inverted",
  CLOSED: "default",
};

const STATUS_LABELS: Record<string, string> = {
  NEW: "Новый",
  TRIAGED: "Рассмотрен",
  AWAITING_CUSTOMER: "Ожидание клиента",
  PLANNED: "Запланирован",
  IN_PROGRESS: "В работе",
  RESOLVED: "Решён",
  CONFIRMED: "Подтверждён",
  CLOSED: "Закрыт",
};

export function ServiceCasesTable({ cases }: { cases: ServiceCase[] }) {
  const router = useRouter();

  if (cases.length === 0) {
    return (
      <div className="text-[--color-7ice-dark-gray] py-12 text-center text-sm">
        Нет обращений
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-[--color-7ice-border] text-xs text-[--color-7ice-mid-gray]">
            <th scope="col" className="px-4 py-3 font-medium">Номер</th>
            <th scope="col" className="px-4 py-3 font-medium">Тип</th>
            <th scope="col" className="px-4 py-3 font-medium">Важность</th>
            <th scope="col" className="px-4 py-3 font-medium">Название</th>
            <th scope="col" className="px-4 py-3 font-medium">Статус</th>
            <th scope="col" className="px-4 py-3 font-medium">Клиент</th>
            <th scope="col" className="px-4 py-3 font-medium" />
          </tr>
        </thead>
        <tbody>
          {cases.map((c) => (
            <tr key={c.id} className="border-b border-[--color-7ice-border]">
              <td className="px-4 py-3 font-mono text-xs">#{c.caseNumber}</td>
              <td className="px-4 py-3">
                <Badge tone="default">{TYPE_LABELS[c.type] ?? c.type}</Badge>
              </td>
              <td className="px-4 py-3">
                <Badge tone={SEVERITY_TONES[c.severity] ?? "default"}>
                  {c.severity}
                </Badge>
              </td>
              <td className="px-4 py-3 max-w-[250px] truncate">{c.title}</td>
              <td className="px-4 py-3">
                <Badge tone={STATUS_TONES[c.status] ?? "default"}>
                  {STATUS_LABELS[c.status] ?? c.status}
                </Badge>
              </td>
              <td className="px-4 py-3 text-xs text-[--color-7ice-mid-gray]">
                {c.contact ? `${c.contact.firstName} ${c.contact.lastName}` : "—"}
              </td>
              <td className="px-4 py-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push(`/admin/service-cases/${c.id}`)}
                >
                  Открыть
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
