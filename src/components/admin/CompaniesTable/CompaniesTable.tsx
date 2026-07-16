"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { TextInput } from "@/components/ui/text-input";

interface Company {
  id: string;
  name: string;
  industry: string | null;
  website: string | null;
  phone: string | null;
  contactsCount: number;
  dealsCount: number;
  createdAt: string;
}

interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

interface CompaniesResponse {
  data: Company[];
  pagination: Pagination;
}

export function CompaniesTable() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("");
  const [phone, setPhone] = useState("");

  const { data, isLoading } = useQuery<CompaniesResponse>({
    queryKey: ["admin", "crm", "companies", { search, page }],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), pageSize: "20" });
      if (search) params.set("search", search);
      const response = await fetch(`/api/v1/admin/crm/companies?${params}`);
      if (!response.ok) throw new Error("Failed to fetch companies");
      return response.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/v1/admin/crm/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, industry: industry || undefined, phone: phone || undefined }),
      });
      if (!response.ok) throw new Error("Failed to create company");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "crm", "companies"] });
      setShowCreate(false);
      setName("");
      setIndustry("");
      setPhone("");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (companyId: string) => {
      const response = await fetch(`/api/v1/admin/crm/companies/${companyId}`, { method: "DELETE" });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail ?? "Failed to delete company");
      }
      return response.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "crm", "companies"] }),
  });

  const companies = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex-1">
          <label htmlFor="company-search" className="mb-1.5 block text-sm font-medium text-brand-graphite">Поиск</label>
          <TextInput id="company-search" placeholder="Название или отрасль..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <Button onClick={() => setShowCreate(!showCreate)}>{showCreate ? "Отмена" : "Добавить компанию"}</Button>
      </div>

      {showCreate && (
        <div className="max-w-xl space-y-3 rounded-card border border-border-subtle bg-brand-white p-4">
          <div>
            <label htmlFor="comp-name" className="mb-1 block text-sm font-medium text-brand-graphite">Название *</label>
            <TextInput id="comp-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="ООО Ромашка" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="comp-industry" className="mb-1 block text-sm font-medium text-brand-graphite">Отрасль</label>
              <TextInput id="comp-industry" value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="Строительство" />
            </div>
            <div>
              <label htmlFor="comp-phone" className="mb-1 block text-sm font-medium text-brand-graphite">Телефон</label>
              <TextInput id="comp-phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+7 495 123-45-67" />
            </div>
          </div>
          <Button onClick={() => createMutation.mutate()} disabled={!name || createMutation.isPending}>
            {createMutation.isPending ? "Создание..." : "Создать"}
          </Button>
        </div>
      )}

      <div className="overflow-hidden rounded-card border border-border-subtle">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-muted text-xs uppercase tracking-wide text-brand-graphite/60">
            <tr>
              <th scope="col" className="px-4 py-3">Название</th>
              <th scope="col" className="px-4 py-3">Отрасль</th>
              <th scope="col" className="px-4 py-3">Телефон</th>
              <th scope="col" className="px-4 py-3">Контакты</th>
              <th scope="col" className="px-4 py-3">Сделки</th>
              <th scope="col" className="px-4 py-3">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {isLoading ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-brand-graphite/50">Загрузка...</td></tr>
            ) : companies.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-brand-graphite/50">Компании не найдены</td></tr>
            ) : companies.map((c) => (
              <tr key={c.id} className="bg-brand-white">
                <td className="px-4 py-3 font-medium text-brand-graphite">{c.name}</td>
                <td className="px-4 py-3 text-brand-graphite/60">{c.industry ?? "—"}</td>
                <td className="px-4 py-3 text-brand-graphite/60">{c.phone ?? "—"}</td>
                <td className="px-4 py-3 text-brand-graphite/60">{c.contactsCount}</td>
                <td className="px-4 py-3 text-brand-graphite/60">{c.dealsCount}</td>
                <td className="px-4 py-3">
                  <Button size="sm" variant="ghost" onClick={() => { if (confirm(`Удалить компанию "${c.name}"?`)) deleteMutation.mutate(c.id); }}>
                    Удалить
                  </Button>
                </td>
              </tr>
            ))}
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
