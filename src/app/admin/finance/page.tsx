import type { Metadata } from "next";
import Link from "next/link";
import type { Route } from "next";

import { Button } from "@/components/ui/button";
import { InvoicesTable } from "@/components/admin/InvoicesTable/InvoicesTable";

export const metadata: Metadata = {
  title: "Финансы",
};

export default function AdminFinancePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-graphite">Финансы</h1>
          <p className="mt-2 text-sm text-brand-graphite/70">
            Управление счетами и платежами.
          </p>
        </div>
        <Link href={"/admin/finance/invoices/new" as Route}>
          <Button>Новый счёт</Button>
        </Link>
      </div>

      <InvoicesTable />
    </div>
  );
}
