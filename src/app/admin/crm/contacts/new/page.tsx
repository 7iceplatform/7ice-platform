"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Route } from "next";

import { Button } from "@/components/ui/button";

export default function NewContactPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [position, setPosition] = useState("");
  const [companyId, setCompanyId] = useState("");

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
      const response = await fetch("/api/v1/admin/crm/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName: lastName || undefined,
          email: email || undefined,
          phone: phone || undefined,
          position: position || undefined,
          companyId: companyId || undefined,
        }),
      });
      if (!response.ok) throw new Error("Failed to create");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "contacts"] });
      router.push("/admin/crm" as Route);
    },
  });

  const companies = companiesData?.data ?? [];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-graphite">Новый контакт</h1>
        <p className="mt-2 text-sm text-brand-graphite/70">Добавление нового контакта в CRM.</p>
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); createMutation.mutate(); }}
        className="space-y-4 rounded-card border border-border-subtle bg-brand-white p-6"
      >
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="c-first" className="mb-1.5 block text-sm font-medium text-brand-graphite">Имя *</label>
            <input
              id="c-first"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className="h-10 w-full rounded-card border border-border-subtle bg-brand-white px-3 text-sm text-brand-graphite"
              placeholder="Иван"
            />
          </div>

          <div>
            <label htmlFor="c-last" className="mb-1.5 block text-sm font-medium text-brand-graphite">Фамилия</label>
            <input
              id="c-last"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="h-10 w-full rounded-card border border-border-subtle bg-brand-white px-3 text-sm text-brand-graphite"
              placeholder="Иванов"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="c-email" className="mb-1.5 block text-sm font-medium text-brand-graphite">Email</label>
            <input
              id="c-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-10 w-full rounded-card border border-border-subtle bg-brand-white px-3 text-sm text-brand-graphite"
              placeholder="ivan@example.com"
            />
          </div>

          <div>
            <label htmlFor="c-phone" className="mb-1.5 block text-sm font-medium text-brand-graphite">Телефон</label>
            <input
              id="c-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="h-10 w-full rounded-card border border-border-subtle bg-brand-white px-3 text-sm text-brand-graphite"
              placeholder="+7 (999) 123-45-67"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="c-position" className="mb-1.5 block text-sm font-medium text-brand-graphite">Должность</label>
            <input
              id="c-position"
              type="text"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              className="h-10 w-full rounded-card border border-border-subtle bg-brand-white px-3 text-sm text-brand-graphite"
              placeholder="Инженер"
            />
          </div>

          <div>
            <label htmlFor="c-company" className="mb-1.5 block text-sm font-medium text-brand-graphite">Компания</label>
            <select
              id="c-company"
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
          <Button type="submit" disabled={createMutation.isPending || !firstName}>
            {createMutation.isPending ? "Создание..." : "Создать контакт"}
          </Button>
        </div>
      </form>
    </div>
  );
}
