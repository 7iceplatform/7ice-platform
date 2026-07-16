import type { Metadata } from "next";

import { NotificationsTable } from "@/components/admin/NotificationsTable/NotificationsTable";

export const metadata: Metadata = {
  title: "Уведомления",
};

export default function AdminNotificationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-graphite">Уведомления</h1>
        <p className="mt-2 text-sm text-brand-graphite/70">
          Управление уведомлениями системы.
        </p>
      </div>

      <NotificationsTable />
    </div>
  );
}
