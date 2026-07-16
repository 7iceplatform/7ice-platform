"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";

import { Button } from "@/components/ui/button";
import { ContactsTable } from "@/components/admin/ContactsTable/ContactsTable";
import { CompaniesTable } from "@/components/admin/CompaniesTable/CompaniesTable";
import { DealsTable } from "@/components/admin/DealsTable/DealsTable";
import { ActivitiesTable } from "@/components/admin/ActivitiesTable/ActivitiesTable";

type Tab = "contacts" | "companies" | "deals" | "activities";

const tabLabels: Record<Tab, string> = {
  contacts: "Контакты",
  companies: "Компании",
  deals: "Сделки",
  activities: "Активности",
};

const tabCreateLinks: Record<Tab, Route> = {
  contacts: "/admin/crm/contacts/new" as Route,
  companies: "/admin/crm/companies/new" as Route,
  deals: "/admin/crm/deals/new" as Route,
  activities: "/admin/crm/activities/new" as Route,
};

const tabCreateLabels: Record<Tab, string> = {
  contacts: "Новый контакт",
  companies: "Новая компания",
  deals: "Новая сделка",
  activities: "Новая активность",
};

export default function AdminCrmPage() {
  const [tab, setTab] = useState<Tab>("contacts");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-graphite">CRM</h1>
          <p className="mt-2 text-sm text-brand-graphite/70">
            Управление контактами, компаниями и сделками.
          </p>
        </div>
        <Link href={tabCreateLinks[tab]}>
          <Button>{tabCreateLabels[tab]}</Button>
        </Link>
      </div>

      <div className="flex gap-1 border-b border-border-subtle">
        {(Object.keys(tabLabels) as Tab[]).map((key) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              tab === key
                ? "border-b-2 border-brand-blue text-brand-blue"
                : "text-brand-graphite/60 hover:text-brand-graphite"
            }`}
          >
            {tabLabels[key]}
          </button>
        ))}
      </div>

      {tab === "contacts" && <ContactsTable />}
      {tab === "companies" && <CompaniesTable />}
      {tab === "deals" && <DealsTable />}
      {tab === "activities" && <ActivitiesTable />}
    </div>
  );
}
