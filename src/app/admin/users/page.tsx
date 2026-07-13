import type { Metadata } from "next";

import { UsersTable } from "@/components/admin/UsersTable";

export const metadata: Metadata = {
  title: "Пользователи",
};

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-graphite">Пользователи</h1>
        <p className="mt-2 text-sm text-brand-graphite/70">
          Управление пользователями и их ролями в системе.
        </p>
      </div>

      <UsersTable />
    </div>
  );
}
