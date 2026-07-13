"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import type { Route } from "next";

import { Button } from "@/components/ui/button";

function LoginForm() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/admin";

  useEffect(() => {
    if (session) {
      router.replace(callbackUrl as Route);
    }
  }, [session, router, callbackUrl]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-muted">
        <div className="text-sm text-brand-graphite/50">Загрузка...</div>
      </div>
    );
  }

  if (session) {
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-muted">
      <div className="w-full max-w-sm space-y-6 rounded-card border border-border-subtle bg-brand-white p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-brand-graphite">7ice</h1>
          <p className="mt-2 text-sm text-brand-graphite/60">
            Войдите в панель управления
          </p>
        </div>

        <Button
          fullWidth
          size="lg"
          onClick={() => signIn("7ice-identity", { callbackUrl })}
        >
          Войти через Identity
        </Button>

        <p className="text-center text-xs text-brand-graphite/40">
          Аутентификация через корпоративный Identity-провайдер (OIDC).
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-surface-muted">
          <div className="text-sm text-brand-graphite/50">Загрузка...</div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
