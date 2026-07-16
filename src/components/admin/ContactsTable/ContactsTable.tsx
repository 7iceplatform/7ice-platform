"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { TextInput } from "@/components/ui/text-input";

interface Contact {
  id: string;
  firstName: string;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  position: string | null;
  company: { id: string; name: string } | null;
  dealsCount: number;
  activitiesCount: number;
  createdAt: string;
}

interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

interface ContactsResponse {
  data: Contact[];
  pagination: Pagination;
}

export function ContactsTable() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const { data, isLoading } = useQuery<ContactsResponse>({
    queryKey: ["admin", "crm", "contacts", { search, page }],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), pageSize: "20" });
      if (search) params.set("search", search);
      const response = await fetch(`/api/v1/admin/crm/contacts?${params}`);
      if (!response.ok) throw new Error("Failed to fetch contacts");
      return response.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/v1/admin/crm/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName: lastName || undefined,
          email: email || undefined,
          phone: phone || undefined,
        }),
      });
      if (!response.ok) throw new Error("Failed to create contact");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "crm", "contacts"] });
      setShowCreate(false);
      setFirstName("");
      setLastName("");
      setEmail("");
      setPhone("");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (contactId: string) => {
      const response = await fetch(`/api/v1/admin/crm/contacts/${contactId}`, { method: "DELETE" });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail ?? "Failed to delete contact");
      }
      return response.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "crm", "contacts"] }),
  });

  const contacts = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex-1">
          <label htmlFor="contact-search" className="mb-1.5 block text-sm font-medium text-brand-graphite">Поиск</label>
          <TextInput id="contact-search" placeholder="Имя, фамилия или email..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <Button onClick={() => setShowCreate(!showCreate)}>{showCreate ? "Отмена" : "Добавить контакт"}</Button>
      </div>

      {showCreate && (
        <div className="max-w-xl space-y-3 rounded-card border border-border-subtle bg-brand-white p-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="c-first" className="mb-1 block text-sm font-medium text-brand-graphite">Имя *</label>
              <TextInput id="c-first" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Иван" />
            </div>
            <div>
              <label htmlFor="c-last" className="mb-1 block text-sm font-medium text-brand-graphite">Фамилия</label>
              <TextInput id="c-last" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Иванов" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="c-email" className="mb-1 block text-sm font-medium text-brand-graphite">Email</label>
              <TextInput id="c-email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ivan@example.com" />
            </div>
            <div>
              <label htmlFor="c-phone" className="mb-1 block text-sm font-medium text-brand-graphite">Телефон</label>
              <TextInput id="c-phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+7 900 123-45-67" />
            </div>
          </div>
          <Button onClick={() => createMutation.mutate()} disabled={!firstName || createMutation.isPending}>
            {createMutation.isPending ? "Создание..." : "Создать"}
          </Button>
        </div>
      )}

      <div className="overflow-hidden rounded-card border border-border-subtle">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-muted text-xs uppercase tracking-wide text-brand-graphite/60">
            <tr>
              <th scope="col" className="px-4 py-3">Имя</th>
              <th scope="col" className="px-4 py-3">Email</th>
              <th scope="col" className="px-4 py-3">Телефон</th>
              <th scope="col" className="px-4 py-3">Компания</th>
              <th scope="col" className="px-4 py-3">Сделки</th>
              <th scope="col" className="px-4 py-3">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {isLoading ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-brand-graphite/50">Загрузка...</td></tr>
            ) : contacts.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-brand-graphite/50">Контакты не найдены</td></tr>
            ) : contacts.map((c) => (
              <tr key={c.id} className="bg-brand-white">
                <td className="px-4 py-3 font-medium text-brand-graphite">{c.firstName} {c.lastName ?? ""}</td>
                <td className="px-4 py-3 text-brand-graphite/60">{c.email ?? "—"}</td>
                <td className="px-4 py-3 text-brand-graphite/60">{c.phone ?? "—"}</td>
                <td className="px-4 py-3 text-brand-graphite/60">{c.company?.name ?? "—"}</td>
                <td className="px-4 py-3 text-brand-graphite/60">{c.dealsCount}</td>
                <td className="px-4 py-3">
                  <Button size="sm" variant="ghost" onClick={() => { if (confirm(`Удалить контакт "${c.firstName}"?`)) deleteMutation.mutate(c.id); }}>
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
