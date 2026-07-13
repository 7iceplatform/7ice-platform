import { describe, expect, it } from "vitest";

import { authorizationService } from "@/server/services/authorization-service";
import type { AuthenticatedActor } from "@/types/auth";

const actor: AuthenticatedActor = {
  externalSubject: "sub-1",
  id: "user-1",
  permissions: ["admin.access", "admin.users.read"],
  roles: ["administrator"],
};

describe("AuthorizationService", () => {
  it("returns true when the actor has the requested permission", () => {
    expect(authorizationService.hasPermission(actor, "admin.access")).toBe(true);
  });

  it("returns false when the actor lacks the requested permission", () => {
    expect(authorizationService.hasPermission(actor, "admin.users.manage")).toBe(false);
  });

  it("throws unauthorized when no actor is provided", () => {
    expect(() => authorizationService.requirePermission(null, "admin.access")).toThrow(
      "Unauthorized",
    );
  });

  it("throws forbidden when the actor lacks the requested permission", () => {
    expect(() => authorizationService.requirePermission(actor, "admin.users.manage")).toThrow(
      "Forbidden",
    );
  });
});
