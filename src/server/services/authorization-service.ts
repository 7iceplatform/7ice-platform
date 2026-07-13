import { errors } from "@/lib/errors/app-error";
import type { AuthenticatedActor } from "@/types/auth";

export class AuthorizationService {
  hasPermission(actor: AuthenticatedActor, permission: string): boolean {
    return actor.permissions.includes(permission);
  }

  requirePermission(
    actor: AuthenticatedActor | null,
    permission: string,
  ): asserts actor is AuthenticatedActor {
    if (!actor) {
      throw errors.unauthorized();
    }

    if (!this.hasPermission(actor, permission)) {
      throw errors.forbidden();
    }
  }
}

export const authorizationService = new AuthorizationService();
