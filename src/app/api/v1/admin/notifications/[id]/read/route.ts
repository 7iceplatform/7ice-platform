import { NextResponse } from "next/server";

import { getCurrentActor } from "@/auth/current-actor";
import { PERMISSIONS } from "@/config/permissions";
import { prisma } from "@/server/db/prisma";
import { authorizationService } from "@/server/services/authorization-service";
import { withApiHandler } from "@/lib/http/with-api-handler";
import { errors } from "@/lib/errors/app-error";

export const dynamic = "force-dynamic";

export const POST = withApiHandler(async ({ params, requestId }) => {
  const actor = await getCurrentActor();
  if (!actor) throw errors.unauthorized();
  if (!authorizationService.hasPermission(actor, PERMISSIONS.ADMIN_ACCESS)) {
    throw errors.forbidden();
  }

  const notificationId = params?.id;
  if (!notificationId) throw errors.forbidden("Invalid notification ID.");

  const existing = await prisma.notification.findUnique({ where: { id: notificationId } });
  if (!existing) throw errors.forbidden("Notification not found.");

  await prisma.notification.update({
    where: { id: notificationId },
    data: { readAt: new Date(), status: "DELIVERED" },
  });

  return NextResponse.json({ success: true, requestId });
});
