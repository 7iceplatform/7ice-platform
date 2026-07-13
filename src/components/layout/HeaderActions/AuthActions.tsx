"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import { signIn, signOut, useSession } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { PERMISSIONS } from "@/config/permissions";

export function AuthActions() {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  if (status === "loading") {
    return null;
  }

  if (!session) {
    return (
      <Button
        size="sm"
        variant="secondary"
        onClick={() => signIn("7ice-identity", { callbackUrl: pathname })}
      >
        Войти
      </Button>
    );
  }

  const canAccessAdmin = session.user.permissions.includes(PERMISSIONS.ADMIN_ACCESS);

  return (
    <div className="flex items-center gap-3">
      {canAccessAdmin ? (
        <Link className="text-sm font-semibold hover:text-brand-blue" href={"/admin" as Route}>
          Админ
        </Link>
      ) : null}

      <span className="max-w-[10rem] truncate text-sm text-brand-graphite/80">
        {session.user.name ?? session.user.email}
      </span>

      <Button size="sm" variant="secondary" onClick={() => signOut()}>
        Выйти
      </Button>
    </div>
  );
}
