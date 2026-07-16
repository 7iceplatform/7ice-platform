"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Route } from "next";

import { Button } from "@/components/ui/button";

export default function NewInvoicePage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [contactId, setContactId] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [workOrderId, setWorkOrderId] = useState("");
  const [amountRub, setAmountRub] = useState("");
  const [taxRub, setTaxRub] = useState("0");
  const [description, setDescription] = useState("");
  const [dueAt, setDueAt] = useState("");

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

  const { data: ordersData } = useQuery<{ data: { id: string; workOrderNumber: number; title: string }[] }>({
    queryKey: ["admin", "orders"],
    queryFn: async () => {
      const response = await fetch("/api/v1/admin/orders?pageSize=100");
      if (!response.ok) throw new Error("Failed to fetch orders");
      return response.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const amountCents = Math.round(parseFloat(amountRub || "0") * 100);
      const taxCents = Math.round(parseFloat(taxRub || "0") * 100);

      const response = await fetch("/api/v1/admin/finance/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contactId: contactId || undefined,
          companyId: companyId || undefined,
          workOrderId: workOrderId || undefined,
          amountCents,
          taxCents,
          description: description || undefined,
          dueAt: dueAt || undefined,
        }),
      });
      if (!response.ok) throw new Error("Failed to create");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "invoices"] });
      router.push("/admin/finance" as Route);
    },
  });

  const contacts = contactsData?.data ?? [];
  const companies = companiesData?.data ?? [];
  const orders = ordersData?.data ?? [];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-graphite">Новый счёт</h1>
        <p className="mt-2 text-sm text-brand-graphite/70">Создание счёта для клиента.</p>
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); createMutation.mutate(); }}
        className="space-y-4 rounded-card border border-border-subtle bg-brand-white p-6"
      >
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="inv-contact" className="mb-1.5 block text-sm font-medium text-brand-graphite">Контакт</label>
            <select
              id="inv-contact"
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
            <label htmlFor="inv-company" className="mb-1.5 block text-sm font-medium text-brand-graphite">Компания</label>
            <select
              id="inv-company"
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

        <div>
          <label htmlFor="inv-order" className="mb-1.5 block text-sm font-medium text-brand-graphite">Заказ</label>
          <select
            id="inv-order"
            value={workOrderId}
            onChange={(e) => setWorkOrderId(e.target.value)}
            className="h-10 w-full rounded-card border border-border-subtle bg-brand-white px-3 text-sm text-brand-graphite"
          >
            <option value="">Не привязан</option>
            {orders.map((o) => (
              <option key={o.id} value={o.id}>#{o.workOrderNumber} — {o.title}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="inv-amount" className="mb-1.5 block text-sm font-medium text-brand-graphite">Сумма (₽) *</label>
            <input
              id="inv-amount"
              type="number"
              step="0.01"
              min="0"
              value={amountRub}
              onChange={(e) => setAmountRub(e.target.value)}
              required
              className="h-10 w-full rounded-card border border-border-subtle bg-brand-white px-3 text-sm text-brand-graphite"
              placeholder="0.00"
            />
          </div>

          <div>
            <label htmlFor="inv-tax" className="mb-1.5 block text-sm font-medium text-brand-graphite">Налог (₽)</label>
            <input
              id="inv-tax"
              type="number"
              step="0.01"
              min="0"
              value={taxRub}
              onChange={(e) => setTaxRub(e.target.value)}
              className="h-10 w-full rounded-card border border-border-subtle bg-brand-white px-3 text-sm text-brand-graphite"
              placeholder="0.00"
            />
          </div>
        </div>

        <div>
          <label htmlFor="inv-desc" className="mb-1.5 block text-sm font-medium text-brand-graphite">Описание</label>
          <textarea
            id="inv-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full rounded-card border border-border-subtle bg-brand-white px-3 py-2 text-sm text-brand-graphite"
            placeholder="Назначение платежа..."
          />
        </div>

        <div>
          <label htmlFor="inv-due" className="mb-1.5 block text-sm font-medium text-brand-graphite">Срок оплаты</label>
          <input
            id="inv-due"
            type="date"
            value={dueAt}
            onChange={(e) => setDueAt(e.target.value)}
            className="h-10 w-full rounded-card border border-border-subtle bg-brand-white px-3 text-sm text-brand-graphite"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={() => router.back()}>
            Отмена
          </Button>
          <Button type="submit" disabled={createMutation.isPending || !amountRub}>
            {createMutation.isPending ? "Создание..." : "Создать счёт"}
          </Button>
        </div>
      </form>
    </div>
  );
}
