import Link from "next/link";
import type { Route } from "next";

import { getCurrentActor } from "@/auth/current-actor";

export default async function AdminPage() {
  const actor = await getCurrentActor();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-graphite">Панель управления</h1>
        <p className="mt-2 text-sm text-brand-graphite/70">
          Управление пользователями, аудитом и настройками платформы.
        </p>
      </div>

      <section className="rounded-card border border-border-subtle bg-brand-white p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-graphite/60">
          Текущий пользователь
        </h2>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="font-medium text-brand-graphite/60">ID</dt>
            <dd className="mt-1 font-mono text-brand-graphite">{actor?.id}</dd>
          </div>
          <div>
            <dt className="font-medium text-brand-graphite/60">Роли</dt>
            <dd className="mt-1 text-brand-graphite">
              {actor?.roles.length ? actor.roles.join(", ") : "—"}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="font-medium text-brand-graphite/60">Права</dt>
            <dd className="mt-1 text-brand-graphite">
              {actor?.permissions.length ? actor.permissions.join(", ") : "—"}
            </dd>
          </div>
        </dl>
      </section>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link
          href={"/admin/users" as Route}
          className="rounded-card border border-border-subtle bg-brand-white p-6 transition-all duration-200 hover:border-brand-blue hover:shadow-sm"
        >
          <h3 className="text-lg font-semibold text-brand-graphite">Пользователи</h3>
          <p className="mt-2 text-sm text-brand-graphite/60">
            Управление пользователями, ролями и назначениями.
          </p>
        </Link>

        <Link
          href={"/admin/audit" as Route}
          className="rounded-card border border-border-subtle bg-brand-white p-6 transition-all duration-200 hover:border-brand-blue hover:shadow-sm"
        >
          <h3 className="text-lg font-semibold text-brand-graphite">Аудит</h3>
          <p className="mt-2 text-sm text-brand-graphite/60">
            Журнал действий пользователей и системных событий.
          </p>
        </Link>
      </div>
    </div>
  );
}
