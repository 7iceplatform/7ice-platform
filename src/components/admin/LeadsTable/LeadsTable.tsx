"use client";

import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Lead {
  id: string;
  firstName: string;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  company: string | null;
  source: string;
  status: string;
  campaign: string | null;
  createdAt: string;
}

const STATUS_LABELS: Record<string, string> = {
  NEW: "Новый", CONTACTED: "Контакт установлен", QUALIFIED: "Квалифицирован",
  CONVERTED: "Конвертирован", DISCARDED: "Отклонён",
};

const STATUS_TONES: Record<string, "default" | "info" | "warning" | "inverted"> = {
  NEW: "info", CONTACTED: "default", QUALIFIED: "default", CONVERTED: "inverted", DISCARDED: "warning",
};

const SOURCE_LABELS: Record<string, string> = {
  WEBSITE: "Сайт", REFERRAL: "Рекомендация", ADVERTISEMENT: "Реклама",
  SOCIAL_MEDIA: "Соцсети", TRADE_SHOW: "Выставка", COLD_CALL: "Холодный звонок", OTHER: "Другое",
};

export function LeadsTable({ leads }: { leads: Lead[] }) {
  const router = useRouter();

  if (leads.length === 0) {
    return <div className="py-12 text-center text-sm text-[--color-7ice-mid-gray]">Нет лидов</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-[--color-7ice-border] text-xs text-[--color-7ice-mid-gray]">
            <th scope="col" className="px-4 py-3 font-medium">Имя</th>
            <th scope="col" className="px-4 py-3 font-medium">Email</th>
            <th scope="col" className="px-4 py-3 font-medium">Компания</th>
            <th scope="col" className="px-4 py-3 font-medium">Источник</th>
            <th scope="col" className="px-4 py-3 font-medium">Статус</th>
            <th scope="col" className="px-4 py-3 font-medium">Кампания</th>
            <th scope="col" className="px-4 py-3 font-medium" />
          </tr>
        </thead>
        <tbody>
          {leads.map((l) => (
            <tr key={l.id} className="border-b border-[--color-7ice-border]">
              <td className="px-4 py-3">
                {l.firstName} {l.lastName ?? ""}
              </td>
              <td className="px-4 py-3 text-xs text-[--color-7ice-mid-gray]">{l.email ?? "—"}</td>
              <td className="px-4 py-3 text-xs text-[--color-7ice-mid-gray]">{l.company ?? "—"}</td>
              <td className="px-4 py-3">
                <Badge tone="default">{SOURCE_LABELS[l.source] ?? l.source}</Badge>
              </td>
              <td className="px-4 py-3">
                <Badge tone={STATUS_TONES[l.status] ?? "default"}>{STATUS_LABELS[l.status] ?? l.status}</Badge>
              </td>
              <td className="px-4 py-3 text-xs text-[--color-7ice-mid-gray]">{l.campaign ?? "—"}</td>
              <td className="px-4 py-3">
                <Button variant="ghost" size="sm" onClick={() => router.push(`/admin/leads/${l.id}`)}>
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
