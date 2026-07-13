import type { Metadata } from "next";

import { AuditTable } from "@/components/admin/AuditTable";

export const metadata: Metadata = {
  title: "Аудит",
};

export default function AdminAuditPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-graphite">Журнал аудита</h1>
        <p className="mt-2 text-sm text-brand-graphite/70">
          История действий пользователей и системных событий.
        </p>
      </div>

      <AuditTable />
    </div>
  );
}
