import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentActor } from "@/auth/current-actor";
import { PERMISSIONS } from "@/config/permissions";
import { prisma } from "@/server/db/prisma";
import { authorizationService } from "@/server/services/authorization-service";
import { auditService } from "@/server/services/audit-service";
import { withApiHandler } from "@/lib/http/with-api-handler";
import { errors } from "@/lib/errors/app-error";

export const dynamic = "force-dynamic";

const updateRoleSchema = z.object({
  roleId: z.string().min(1),
  action: z.enum(["assign", "revoke"]),
});

export const PATCH = withApiHandler(async ({ params, request, requestId }) => {
  const actor = await getCurrentActor();
  if (!actor) throw errors.unauthorized();
  if (!authorizationService.hasPermission(actor, PERMISSIONS.ADMIN_USERS_MANAGE)) {
    throw errors.forbidden();
  }

  const userId = params?.id;
  if (!userId) {
    throw errors.forbidden("Invalid user ID.");
  }

  const body = await request.json();
  const parsed = updateRoleSchema.safeParse(body);

  if (!parsed.success) {
    throw errors.forbidden("Invalid request body.");
  }

  const { roleId, action } = parsed.data;

  const targetUser = await prisma.user.findUnique({ where: { id: userId } });
  if (!targetUser) {
    throw errors.forbidden("User not found.");
  }

  const role = await prisma.role.findUnique({ where: { id: roleId } });
  if (!role) {
    throw errors.forbidden("Role not found.");
  }

  if (action === "assign") {
    await prisma.roleAssignment.upsert({
      where: {
        userId_roleId: { userId, roleId },
      },
      create: {
        assignedBy: actor.id,
        roleId,
        userId,
      },
      update: {},
    });
  } else {
    await prisma.roleAssignment.deleteMany({
      where: { roleId, userId },
    });
  }

  await auditService.record({
    action: action === "assign" ? "role.assigned" : "role.revoked",
    actorId: actor.id,
    metadata: { roleId, roleCode: role.code, targetUserId: userId },
    requestId,
    resourceId: userId,
    resourceType: "user",
  });

  return NextResponse.json({ success: true, requestId });
});
