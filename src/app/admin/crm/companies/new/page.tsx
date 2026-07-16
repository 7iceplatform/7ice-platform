"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Route } from "next";

import { Button } from "@/components/ui/button";

export default function NewCompanyPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("");
  const [website, setWebsite] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const createMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/v1/admin/crm/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          industry: industry || undefined,
          website: website || undefined,
          phone: phone || undefined,
          address: address || undefined,
        }),
      });
      if (!response.ok) throw new Error("Failed to create");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "companies"] });
      router.push("/admin/crm" as Route);
    },
  });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-graphite">Новая компания</h1>
        <p className="mt-2 text-sm text-brand-graphite/70">Добавление новой компании в CRM.</p>
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); createMutation.mutate(); }}
        className="space-y-4 rounded-card border border-border-subtle bg-brand-white p-6"
      >
        <div>
          <label htmlFor="comp-name" className="mb-1.5 block text-sm font-medium text-brand-graphite">Название *</label>
          <input
            id="comp-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="h-10 w-full rounded-card border border-border-subtle bg-brand-white px-3 text-sm text-brand-graphite"
            placeholder="ООО «Компания»"
          />
        </div>

        <div>
          <label htmlFor="comp-industry" className="mb-1.5 block text-sm font-medium text-brand-graphite">Отрасль</label>
          <input
            id="comp-industry"
            type="text"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            className="h-10 w-full rounded-card border border-border-subtle bg-brand-white px-3 text-sm text-brand-graphite"
            placeholder="Строительство"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="comp-website" className="mb-1.5 block text-sm font-medium text-brand-graphite">Сайт</label>
            <input
              id="comp-website"
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="h-10 w-full rounded-card border border-border-subtle bg-brand-white px-3 text-sm text-brand-graphite"
              placeholder="https://example.com"
            />
          </div>

          <div>
            <label htmlFor="comp-phone" className="mb-1.5 block text-sm font-medium text-brand-graphite">Телефон</label>
            <input
              id="comp-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="h-10 w-full rounded-card border border-border-subtle bg-brand-white px-3 text-sm text-brand-graphite"
              placeholder="+7 (495) 123-45-67"
            />
          </div>
        </div>

        <div>
          <label htmlFor="comp-address" className="mb-1.5 block text-sm font-medium text-brand-graphite">Адрес</label>
          <input
            id="comp-address"
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="h-10 w-full rounded-card border border-border-subtle bg-brand-white px-3 text-sm text-brand-graphite"
            placeholder="г. Москва, ул. Примерная, д. 1"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={() => router.back()}>
            Отмена
          </Button>
          <Button type="submit" disabled={createMutation.isPending || !name}>
            {createMutation.isPending ? "Создание..." : "Создать компанию"}
          </Button>
        </div>
      </form>
    </div>
  );
}
