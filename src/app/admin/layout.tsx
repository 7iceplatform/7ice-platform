import Link from "next/link";
import type { Route } from "next";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { getCurrentActor } from "@/auth/current-actor";
import { PERMISSIONS } from "@/config/permissions";
import { authorizationService } from "@/server/services/authorization-service";

interface AdminLayoutProperties {
  children: ReactNode;
}

export default async function AdminLayout({ children }: Readonly<AdminLayoutProperties>) {
  const actor = await getCurrentActor();

  if (!actor || !authorizationService.hasPermission(actor, PERMISSIONS.ADMIN_ACCESS)) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-surface-muted">
      <header className="border-b border-border-subtle bg-brand-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-6">
            <span className="text-lg font-bold text-brand-graphite">7ice Admin</span>
            <nav className="flex items-center gap-4 text-sm font-medium text-brand-graphite">
              <Link className="hover:text-brand-blue" href={"/admin" as Route}>
                Обзор
              </Link>
              <Link className="hover:text-brand-blue" href={"/admin/users" as Route}>
                Пользователи
              </Link>
              <Link className="hover:text-brand-blue" href={"/admin/audit" as Route}>
                Аудит
              </Link>
            </nav>
          </div>

          <Link className="text-sm font-medium text-brand-blue hover:opacity-80" href={"/" as Route}>
            На сайт
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
