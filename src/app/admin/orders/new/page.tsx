"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Route } from "next";

import { Button } from "@/components/ui/button";

export default function NewWorkOrderPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [type, setType] = useState<"INSTALLATION" | "SERVICE" | "MAINTENANCE" | "REMEDIATION">("INSTALLATION");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [contactId, setContactId] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [estimatedEndAt, setEstimatedEndAt] = useState("");
  const [siteAddress, setSiteAddress] = useState("");

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
      const response = await fetch("/api/v1/admin/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          title,
          description: description || undefined,
          contactId: contactId || undefined,
          companyId: companyId || undefined,
          scheduledAt: scheduledAt || undefined,
          estimatedEndAt: estimatedEndAt || undefined,
          siteAddress: siteAddress || undefined,
        }),
      });
      if (!response.ok) throw new Error("Failed to create");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
      router.push("/admin/orders" as Route);
    },
  });

  const contacts = contactsData?.data ?? [];
  const companies = companiesData?.data ?? [];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-graphite">Новый заказ</h1>
        <p className="mt-2 text-sm text-brand-graphite/70">Создание заказа на монтаж или обслуживание.</p>
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); createMutation.mutate(); }}
        className="space-y-4 rounded-card border border-border-subtle bg-brand-white p-6"
      >
        <div>
          <label htmlFor="wo-type" className="mb-1.5 block text-sm font-medium text-brand-graphite">Тип *</label>
          <select
            id="wo-type"
            value={type}
            onChange={(e) => setType(e.target.value as typeof type)}
            className="h-10 w-full rounded-card border border-border-subtle bg-brand-white px-3 text-sm text-brand-graphite"
          >
            <option value="INSTALLATION">Монтаж</option>
            <option value="SERVICE">Обслуживание</option>
            <option value="MAINTENANCE">ТО</option>
            <option value="REMEDIATION">Ремонт</option>
          </select>
        </div>

        <div>
          <label htmlFor="wo-title" className="mb-1.5 block text-sm font-medium text-brand-graphite">Название *</label>
          <input
            id="wo-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="h-10 w-full rounded-card border border-border-subtle bg-brand-white px-3 text-sm text-brand-graphite"
            placeholder="Установка кондиционера Daikin"
          />
        </div>

        <div>
          <label htmlFor="wo-desc" className="mb-1.5 block text-sm font-medium text-brand-graphite">Описание</label>
          <textarea
            id="wo-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full rounded-card border border-border-subtle bg-brand-white px-3 py-2 text-sm text-brand-graphite"
            placeholder="Детали заказа..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="wo-contact" className="mb-1.5 block text-sm font-medium text-brand-graphite">Контакт</label>
            <select
              id="wo-contact"
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
            <label htmlFor="wo-company" className="mb-1.5 block text-sm font-medium text-brand-graphite">Компания</label>
            <select
              id="wo-company"
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

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="wo-scheduled" className="mb-1.5 block text-sm font-medium text-brand-graphite">Дата начала</label>
            <input
              id="wo-scheduled"
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="h-10 w-full rounded-card border border-border-subtle bg-brand-white px-3 text-sm text-brand-graphite"
            />
          </div>

          <div>
            <label htmlFor="wo-estimated" className="mb-1.5 block text-sm font-medium text-brand-graphite">Дата окончания</label>
            <input
              id="wo-estimated"
              type="datetime-local"
              value={estimatedEndAt}
              onChange={(e) => setEstimatedEndAt(e.target.value)}
              className="h-10 w-full rounded-card border border-border-subtle bg-brand-white px-3 text-sm text-brand-graphite"
            />
          </div>
        </div>

        <div>
          <label htmlFor="wo-address" className="mb-1.5 block text-sm font-medium text-brand-graphite">Адрес объекта</label>
          <input
            id="wo-address"
            type="text"
            value={siteAddress}
            onChange={(e) => setSiteAddress(e.target.value)}
            className="h-10 w-full rounded-card border border-border-subtle bg-brand-white px-3 text-sm text-brand-graphite"
            placeholder="ул. Примерная, д. 1"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={() => router.back()}>
            Отмена
          </Button>
          <Button type="submit" disabled={createMutation.isPending || !title}>
            {createMutation.isPending ? "Создание..." : "Создать заказ"}
          </Button>
        </div>
      </form>
    </div>
  );
}
