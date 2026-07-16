"use client";

import { IntegrationsTable } from "@/components/admin/IntegrationsTable/IntegrationsTable";
import { WebhooksTable } from "@/components/admin/WebhooksTable/WebhooksTable";

export default function AdminIntegrationsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-brand-graphite">Интеграции</h1>
        <p className="mt-2 text-sm text-brand-graphite/70">
          Управление внешними системами и вебхуками.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-brand-graphite">Системы</h2>
        <IntegrationsTable />
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-brand-graphite">Вебхуки</h2>
        <WebhooksTable />
      </section>
    </div>
  );
}
