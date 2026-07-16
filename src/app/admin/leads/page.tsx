import type { Metadata } from "next";
import Link from "next/link";
import type { Route } from "next";

import { Button } from "@/components/ui/button";
import { LeadsPageClient } from "./LeadsPageClient";

export const metadata: Metadata = {
  title: "Лиды",
};

export default function AdminLeadsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-graphite">Лиды</h1>
          <p className="mt-2 text-sm text-brand-graphite/70">
            Управление лидами и их конвертация в контакты и сделки.
          </p>
        </div>
        <Link href={"/admin/leads/new" as Route}>
          <Button>Новый лид</Button>
        </Link>
      </div>
      <LeadsPageClient />
    </div>
  );
}
