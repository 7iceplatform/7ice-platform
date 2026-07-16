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

const createNotificationSchema = z.object({
  title: z.string().min(1).max(500),
  body: z.string().min(1).max(2000),
  channel: z.enum(["IN_APP", "EMAIL", "SMS", "PUSH"]).optional(),
  userId: z.string().optional(),
  referenceType: z.string().max(100).optional(),
  referenceId: z.string().optional(),
});

export const GET = withApiHandler(async ({ request, requestId }) => {
  const actor = await getCurrentActor();
  if (!actor) throw errors.unauthorized();
  if (!authorizationService.hasPermission(actor, PERMISSIONS.ADMIN_ACCESS)) {
    throw errors.forbidden();
  }

  const url = new URL(request.url);
  const status = url.searchParams.get("status") ?? "";
  const page = Math.max(1, Number(url.searchParams.get("page") ?? "1"));
  const pageSize = Math.min(50, Math.max(1, Number(url.searchParams.get("pageSize") ?? "20")));

  const where: Record<string, unknown> = {};
  if (status) {
    where.status = status;
  }

  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.notification.count({ where }),
  ]);

  return NextResponse.json({
    data: notifications.map((n) => ({
      id: n.id,
      title: n.title,
      body: n.body,
      channel: n.channel,
      status: n.status,
      userId: n.userId,
      referenceType: n.referenceType,
      referenceId: n.referenceId,
      createdAt: n.createdAt.toISOString(),
      sentAt: n.sentAt?.toISOString() ?? null,
      readAt: n.readAt?.toISOString() ?? null,
    })),
    pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    requestId,
  });
});

export const POST = withApiHandler(async ({ request, requestId }) => {
  const actor = await getCurrentActor();
  if (!actor) throw errors.unauthorized();
  if (!authorizationService.hasPermission(actor, PERMISSIONS.ADMIN_ACCESS)) {
    throw errors.forbidden();
  }

  const body = await request.json();
  const parsed = createNotificationSchema.safeParse(body);

  if (!parsed.success) throw errors.forbidden("Invalid request body.");

  const notification = await prisma.notification.create({
    data: {
      title: parsed.data.title,
      body: parsed.data.body,
      channel: parsed.data.channel ?? "IN_APP",
      userId: parsed.data.userId || null,
      referenceType: parsed.data.referenceType || null,
      referenceId: parsed.data.referenceId || null,
    },
  });

  await auditService.record({
    action: "notification.created",
    actorId: actor.id,
    metadata: { title: notification.title, channel: notification.channel },
    requestId,
    resourceId: notification.id,
    resourceType: "notification",
  });

  return NextResponse.json({ data: { id: notification.id }, requestId });
});
