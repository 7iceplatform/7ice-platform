import type { Metadata } from "next";
import Link from "next/link";
import type { Route } from "next";

import { Button } from "@/components/ui/button";
import { ServiceCasesPageClient } from "./ServiceCasesPageClient";

export const metadata: Metadata = {
  title: "Обращения",
};

export default function AdminServiceCasesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-graphite">Обращения</h1>
          <p className="mt-2 text-sm text-brand-graphite/70">
            Управление обращениями клиентов и инцидентами.
          </p>
        </div>
        <Link href={"/admin/service-cases/new" as Route}>
          <Button>Новое обращение</Button>
        </Link>
      </div>
      <ServiceCasesPageClient />
    </div>
  );
}
