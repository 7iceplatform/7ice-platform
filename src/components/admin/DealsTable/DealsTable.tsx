"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { TextInput } from "@/components/ui/text-input";
import { Badge } from "@/components/ui/badge";

interface Deal {
  id: string;
  title: string;
  stage: string;
  valueAmount: number | null;
  valueCurrency: string | null;
  contact: { id: string; firstName: string; lastName: string | null } | null;
  company: { id: string; name: string } | null;
  createdAt: string;
}

interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

interface DealsResponse {
  data: Deal[];
  pagination: Pagination;
}

const STAGE_ORDER = ["NEW", "QUALIFIED", "PROPOSAL", "NEGOTIATION", "WON", "LOST"];

const stageLabels: Record<string, string> = {
  NEW: "Новая",
  QUALIFIED: "Квалификация",
  PROPOSAL: "Предложение",
  NEGOTIATION: "Переговоры",
  WON: "Выиграна",
  LOST: "Проиграна",
};

const stageTone: Record<string, "default" | "info" | "success" | "warning"> = {
  NEW: "default",
  QUALIFIED: "info",
  PROPOSAL: "info",
  NEGOTIATION: "warning",
  WON: "success",
  LOST: "default",
};

function getNextStages(currentStage: string): string[] {
  const idx = STAGE_ORDER.indexOf(currentStage);
  if (idx === -1) return [];
  if (currentStage === "WON" || currentStage === "LOST") return [];
  return STAGE_ORDER.slice(idx + 1, -1);
}

function formatValue(amount: number | null, currency: string | null): string {
  if (amount === null) return "—";
  return new Intl.NumberFormat("ru-RU", { style: "currency", currency: currency ?? "RUB", maximumFractionDigits: 0 }).format(amount / 100);
}

export function DealsTable() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [stage, setStage] = useState("");
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState("");

  const { data, isLoading } = useQuery<DealsResponse>({
    queryKey: ["admin", "crm", "deals", { search, stage, page }],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), pageSize: "20" });
      if (search) params.set("search", search);
      if (stage) params.set("stage", stage);
      const response = await fetch(`/api/v1/admin/crm/deals?${params}`);
      if (!response.ok) throw new Error("Failed to fetch deals");
      return response.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/v1/admin/crm/deals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      if (!response.ok) throw new Error("Failed to create deal");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "crm", "deals"] });
      setShowCreate(false);
      setTitle("");
    },
  });

  const stageMutation = useMutation({
    mutationFn: async ({ dealId, newStage }: { dealId: string; newStage: string }) => {
      const response = await fetch(`/api/v1/admin/crm/deals/${dealId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: newStage }),
      });
      if (!response.ok) throw new Error("Failed to update stage");
      return response.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "crm", "deals"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (dealId: string) => {
      const response = await fetch(`/api/v1/admin/crm/deals/${dealId}`, { method: "DELETE" });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail ?? "Failed to delete deal");
      }
      return response.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "crm", "deals"] }),
  });

  const deals = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex-1">
          <label htmlFor="deal-search" className="mb-1.5 block text-sm font-medium text-brand-graphite">Поиск</label>
          <TextInput id="deal-search" placeholder="Название сделки..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <div>
          <label htmlFor="deal-stage" className="mb-1.5 block text-sm font-medium text-brand-graphite">Этап</label>
          <select
            id="deal-stage"
            value={stage}
            onChange={(e) => { setStage(e.target.value); setPage(1); }}
            className="h-10 rounded-card border border-border-subtle bg-brand-white px-3 text-sm text-brand-graphite"
          >
            <option value="">Все</option>
            {Object.entries(stageLabels).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {showCreate && (
        <div className="max-w-xl space-y-3 rounded-card border border-border-subtle bg-brand-white p-4">
          <div>
            <label htmlFor="deal-title" className="mb-1 block text-sm font-medium text-brand-graphite">Название *</label>
            <TextInput id="deal-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Установка сплита в офисе" />
          </div>
          <Button onClick={() => createMutation.mutate()} disabled={!title || createMutation.isPending}>
            {createMutation.isPending ? "Создание..." : "Создать"}
          </Button>
        </div>
      )}

      <div className="overflow-hidden rounded-card border border-border-subtle">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-muted text-xs uppercase tracking-wide text-brand-graphite/60">
            <tr>
              <th scope="col" className="px-4 py-3">Название</th>
              <th scope="col" className="px-4 py-3">Этап</th>
              <th scope="col" className="px-4 py-3">Сумма</th>
              <th scope="col" className="px-4 py-3">Контакт</th>
              <th scope="col" className="px-4 py-3">Компания</th>
              <th scope="col" className="px-4 py-3">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {isLoading ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-brand-graphite/50">Загрузка...</td></tr>
            ) : deals.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-brand-graphite/50">Сделки не найдены</td></tr>
            ) : deals.map((d) => {
              const nextStages = getNextStages(d.stage);
              return (
                <tr key={d.id} className="bg-brand-white">
                  <td className="px-4 py-3 font-medium text-brand-graphite">{d.title}</td>
                  <td className="px-4 py-3"><Badge tone={stageTone[d.stage] ?? "default"}>{stageLabels[d.stage] ?? d.stage}</Badge></td>
                  <td className="px-4 py-3 text-brand-graphite/60">{formatValue(d.valueAmount, d.valueCurrency)}</td>
                  <td className="px-4 py-3 text-brand-graphite/60">{d.contact ? `${d.contact.firstName} ${d.contact.lastName ?? ""}` : "—"}</td>
                  <td className="px-4 py-3 text-brand-graphite/60">{d.company?.name ?? "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {nextStages.slice(0, 2).map((ns) => (
                        <Button
                          key={ns}
                          size="sm"
                          variant="secondary"
                          onClick={() => stageMutation.mutate({ dealId: d.id, newStage: ns })}
                          disabled={stageMutation.isPending}
                        >
                          {stageLabels[ns] ?? ns}
                        </Button>
                      ))}
                      <Button size="sm" variant="ghost" onClick={() => { if (confirm(`Удалить сделку "${d.title}"?`)) deleteMutation.mutate(d.id); }}>
                        Удалить
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {pagination && pagination.totalPages > 1 ? (
        <div className="flex items-center justify-between text-sm text-brand-graphite/60">
          <span>Стр. {pagination.page} из {pagination.totalPages} ({pagination.total} всего)</span>
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Назад</Button>
            <Button size="sm" variant="secondary" disabled={page >= pagination.totalPages} onClick={() => setPage((p) => p + 1)}>Далее</Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
