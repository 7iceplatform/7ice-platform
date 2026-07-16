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

const updateActivitySchema = z.object({
  type: z.enum(["CALL", "EMAIL", "MEETING", "TASK", "NOTE"]).optional(),
  subject: z.string().min(1).max(500).optional(),
  body: z.string().nullable().optional(),
  contactId: z.string().nullable().optional(),
  dealId: z.string().nullable().optional(),
  dueAt: z.string().datetime().nullable().optional(),
  completedAt: z.string().datetime().nullable().optional(),
});

export const GET = withApiHandler(async ({ params, requestId }) => {
  const actor = await getCurrentActor();
  if (!actor) throw errors.unauthorized();
  if (!authorizationService.hasPermission(actor, PERMISSIONS.CRM_ACTIVITIES_READ)) {
    throw errors.forbidden();
  }

  const activityId = params?.id;
  if (!activityId) throw errors.forbidden("Invalid activity ID.");

  const activity = await prisma.activity.findUnique({
    where: { id: activityId },
    include: {
      contact: { select: { id: true, firstName: true, lastName: true } },
      deal: { select: { id: true, title: true } },
    },
  });

  if (!activity) throw errors.forbidden("Activity not found.");

  return NextResponse.json({
    data: {
      id: activity.id,
      type: activity.type,
      subject: activity.subject,
      body: activity.body,
      contact: activity.contact,
      deal: activity.deal,
      dueAt: activity.dueAt?.toISOString() ?? null,
      completedAt: activity.completedAt?.toISOString() ?? null,
      createdAt: activity.createdAt.toISOString(),
    },
    requestId,
  });
});

export const PATCH = withApiHandler(async ({ params, request, requestId }) => {
  const actor = await getCurrentActor();
  if (!actor) throw errors.unauthorized();
  if (!authorizationService.hasPermission(actor, PERMISSIONS.CRM_ACTIVITIES_MANAGE)) {
    throw errors.forbidden();
  }

  const activityId = params?.id;
  if (!activityId) throw errors.forbidden("Invalid activity ID.");

  const existing = await prisma.activity.findUnique({ where: { id: activityId } });
  if (!existing) throw errors.forbidden("Activity not found.");

  const body = await request.json();
  const parsed = updateActivitySchema.safeParse(body);
  if (!parsed.success) throw errors.forbidden("Invalid request body.");

  const data: Record<string, unknown> = { ...parsed.data };
  if (data.dueAt !== undefined) data.dueAt = data.dueAt ? new Date(data.dueAt as string) : null;
  if (data.completedAt !== undefined) data.completedAt = data.completedAt ? new Date(data.completedAt as string) : null;

  await prisma.activity.update({ where: { id: activityId }, data });

  await auditService.record({
    action: "crm.activity.updated",
    actorId: actor.id,
    metadata: { fields: Object.keys(parsed.data) },
    requestId,
    resourceId: activityId,
    resourceType: "crm.activity",
  });

  return NextResponse.json({ success: true, requestId });
});

export const DELETE = withApiHandler(async ({ params, requestId }) => {
  const actor = await getCurrentActor();
  if (!actor) throw errors.unauthorized();
  if (!authorizationService.hasPermission(actor, PERMISSIONS.CRM_ACTIVITIES_MANAGE)) {
    throw errors.forbidden();
  }

  const activityId = params?.id;
  if (!activityId) throw errors.forbidden("Invalid activity ID.");

  const existing = await prisma.activity.findUnique({ where: { id: activityId } });
  if (!existing) throw errors.forbidden("Activity not found.");

  await prisma.activity.delete({ where: { id: activityId } });

  await auditService.record({
    action: "crm.activity.deleted",
    actorId: actor.id,
    metadata: { subject: existing.subject },
    requestId,
    resourceId: activityId,
    resourceType: "crm.activity",
  });

  return NextResponse.json({ success: true, requestId });
});
