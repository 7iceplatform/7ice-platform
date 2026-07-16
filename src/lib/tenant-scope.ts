import type { AuthenticatedActor } from "@/types/auth";

export function tenantWhere(actor: AuthenticatedActor, extra?: Record<string, unknown>): Record<string, unknown> {
  return {
    ...extra,
    ...(actor.tenantId !== null && { tenantId: actor.tenantId }),
  };
}

export function tenantCreate<T extends Record<string, unknown>>(
  actor: AuthenticatedActor,
  data: T,
): T {
  return {
    ...data,
    ...(actor.tenantId !== null && { tenantId: actor.tenantId }),
  } as T;
}
