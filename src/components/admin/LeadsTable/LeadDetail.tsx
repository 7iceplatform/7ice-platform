"use client";

import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface LeadDetail {
  id: string;
  firstName: string;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  company: string | null;
  source: string;
  status: string;
  campaign: string | null;
  notes: string | null;
  discardedReason: string | null;
  convertedContactId: string | null;
  convertedDealId: string | null;
  createdAt: string;
  consents: { id: string; purpose: string; channel: string; status: string; capturedAt: string }[];
}

const STATUS_LABELS: Record<string, string> = {
  NEW: "Новый", CONTACTED: "Контакт установлен", QUALIFIED: "Квалифицирован",
  CONVERTED: "Конвертирован", DISCARDED: "Отклонён",
};

const STATUS_TONES: Record<string, "default" | "info" | "warning" | "inverted"> = {
  NEW: "info", CONTACTED: "default", QUALIFIED: "default", CONVERTED: "inverted", DISCARDED: "warning",
};

export function LeadDetail({ lead }: { lead: LeadDetail }) {
  const router = useRouter();

  const handleConvert = async () => {
    const res = await fetch(`/api/v1/admin/leads/${lead.id}/convert`, { method: "POST" });
    if (res.ok) router.refresh();
  };

  const handleDiscard = async () => {
    const reason = prompt("Причина отклонения:");
    if (reason === null) return;
    await fetch(`/api/v1/admin/leads/${lead.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "DISCARDED", discardedReason: reason }),
    });
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[--color-7ice-graphite]">
            {lead.firstName} {lead.lastName ?? ""}
          </h1>
          <p className="text-sm text-[--color-7ice-mid-gray]">Лид</p>
        </div>
        <div className="flex gap-2">
          {lead.status !== "CONVERTED" && lead.status !== "DISCARDED" && (
            <>
              <Button variant="secondary" size="sm" onClick={handleConvert}>Конвертировать</Button>
              <Button variant="ghost" size="sm" onClick={handleDiscard}>Отклонить</Button>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-4 space-y-3">
          <h3 className="font-medium text-sm">Данные</h3>
          <div className="text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-[--color-7ice-mid-gray]">Email</span>
              <span>{lead.email ?? "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[--color-7ice-mid-gray]">Телефон</span>
              <span>{lead.phone ?? "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[--color-7ice-mid-gray]">Компания</span>
              <span>{lead.company ?? "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[--color-7ice-mid-gray]">Источник</span>
              <span>{lead.source}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[--color-7ice-mid-gray]">Статус</span>
              <Badge tone={STATUS_TONES[lead.status] ?? "default"}>
                {STATUS_LABELS[lead.status] ?? lead.status}
              </Badge>
            </div>
            {lead.campaign && (
              <div className="flex justify-between">
                <span className="text-[--color-7ice-mid-gray]">Кампания</span>
                <span>{lead.campaign}</span>
              </div>
            )}
          </div>
        </Card>

        <Card className="p-4 space-y-3">
          <h3 className="font-medium text-sm">Конвертация</h3>
          {lead.status === "CONVERTED" ? (
            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-[--color-7ice-mid-gray]">Контакт</span>
                <Button variant="text" size="sm" onClick={() => router.push(`/admin/crm/contacts`)}>
                  Контакт
                </Button>
              </div>
              <div className="flex justify-between">
                <span className="text-[--color-7ice-mid-gray]">Сделка</span>
                <Button variant="text" size="sm" onClick={() => router.push(`/admin/crm`)}>
                  Сделка
                </Button>
              </div>
            </div>
          ) : lead.status === "DISCARDED" ? (
            <div className="text-sm">
              <span className="text-[--color-7ice-mid-gray]">Причина: </span>
              {lead.discardedReason ?? "Не указана"}
            </div>
          ) : (
            <p className="text-sm text-[--color-7ice-mid-gray]">Не конвертирован</p>
          )}
        </Card>
      </div>

      {lead.notes && (
        <Card className="p-4">
          <h3 className="font-medium text-sm mb-2">Заметки</h3>
          <p className="text-sm text-[--color-7ice-dark-gray] whitespace-pre-wrap">{lead.notes}</p>
        </Card>
      )}

      {lead.consents.length > 0 && (
        <Card className="p-4">
          <h3 className="font-medium text-sm mb-2">Согласия</h3>
          <div className="space-y-2">
            {lead.consents.map((c) => (
              <div key={c.id} className="flex items-center gap-3 text-sm">
                <Badge tone="default">{c.purpose}</Badge>
                <Badge tone="info">{c.channel}</Badge>
                <Badge tone={c.status === "GRANTED" ? "inverted" : "warning"}>{c.status}</Badge>
                <span className="text-xs text-[--color-7ice-mid-gray] ml-auto">
                  {new Date(c.capturedAt).toLocaleDateString("ru-RU")}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
