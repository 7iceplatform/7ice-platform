"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Route } from "next";

import { Button } from "@/components/ui/button";

export default function NewDealPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [valueAmount, setValueAmount] = useState("");
  const [contactId, setContactId] = useState("");
  const [companyId, setCompanyId] = useState("");

  const { data: contactsData } = useQuery<{ data: { id: string; firstName: string; lastName: string | null }[] }>({
    queryKey: ["admin", "contacts"],
    queryFn: async () => {
      const response = await fetch("/api/v1/admin/crm/contacts?pageSize=100");
      if (!response.ok) throw new Error("Failed to fetch contacts");
      return response.json();
    },
  });

  const { data: companiesData } = useQuery<{ data: { id: string; name: string }[] }>({
    queryKey: ["admin", "companies"],
    queryFn: async () => {
      const response = await fetch("/api/v1/admin/crm/companies?pageSize=100");
      if (!response.ok) throw new Error("Failed to fetch companies");
      return response.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/v1/admin/crm/deals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description: description || undefined,
          valueAmount: valueAmount ? Math.round(parseFloat(valueAmount) * 100) : undefined,
          contactId: contactId || undefined,
          companyId: companyId || undefined,
        }),
      });
      if (!response.ok) throw new Error("Failed to create");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "deals"] });
      router.push("/admin/crm" as Route);
    },
  });

  const contacts = contactsData?.data ?? [];
  const companies = companiesData?.data ?? [];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-graphite">Новая сделка</h1>
        <p className="mt-2 text-sm text-brand-graphite/70">Создание новой сделки в CRM.</p>
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); createMutation.mutate(); }}
        className="space-y-4 rounded-card border border-border-subtle bg-brand-white p-6"
      >
        <div>
          <label htmlFor="d-title" className="mb-1.5 block text-sm font-medium text-brand-graphite">Название *</label>
          <input
            id="d-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="h-10 w-full rounded-card border border-border-subtle bg-brand-white px-3 text-sm text-brand-graphite"
            placeholder="Установка кондиционеров в офисе"
          />
        </div>

        <div>
          <label htmlFor="d-desc" className="mb-1.5 block text-sm font-medium text-brand-graphite">Описание</label>
          <textarea
            id="d-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full rounded-card border border-border-subtle bg-brand-white px-3 py-2 text-sm text-brand-graphite"
            placeholder="Детали сделки..."
          />
        </div>

        <div>
          <label htmlFor="d-value" className="mb-1.5 block text-sm font-medium text-brand-graphite">Сумма (₽)</label>
          <input
            id="d-value"
            type="number"
            step="0.01"
            min="0"
            value={valueAmount}
            onChange={(e) => setValueAmount(e.target.value)}
            className="h-10 w-full rounded-card border border-border-subtle bg-brand-white px-3 text-sm text-brand-graphite"
            placeholder="0.00"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="d-contact" className="mb-1.5 block text-sm font-medium text-brand-graphite">Контакт</label>
            <select
              id="d-contact"
              value={contactId}
              onChange={(e) => setContactId(e.target.value)}
              className="h-10 w-full rounded-card border border-border-subtle bg-brand-white px-3 text-sm text-brand-graphite"
            >
              <option value="">Не выбран</option>
              {contacts.map((c) => (
                <option key={c.id} value={c.id}>{c.firstName} {c.lastName ?? ""}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="d-company" className="mb-1.5 block text-sm font-medium text-brand-graphite">Компания</label>
            <select
              id="d-company"
              value={companyId}
              onChange={(e) => setCompanyId(e.target.value)}
              className="h-10 w-full rounded-card border border-border-subtle bg-brand-white px-3 text-sm text-brand-graphite"
            >
              <option value="">Не выбрана</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={() => router.back()}>
            Отмена
          </Button>
          <Button type="submit" disabled={createMutation.isPending || !title}>
            {createMutation.isPending ? "Создание..." : "Создать сделку"}
          </Button>
        </div>
      </form>
    </div>
  );
}
