import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentActor } from "@/auth/current-actor";
import { PERMISSIONS } from "@/config/permissions";
import { prisma } from "@/server/db/prisma";
import { authorizationService } from "@/server/services/authorization-service";
import { auditService } from "@/server/services/audit-service";
import { withApiHandler } from "@/lib/http/with-api-handler";
import { errors } from "@/lib/errors/app-error";
import { tenantWhere, tenantCreate } from "@/lib/tenant-scope";

export const dynamic = "force-dynamic";

const createActivitySchema = z.object({
  type: z.enum(["CALL", "EMAIL", "MEETING", "TASK", "NOTE"]),
  subject: z.string().min(1).max(500),
  body: z.string().optional(),
  contactId: z.string().optional(),
  dealId: z.string().optional(),
  dueAt: z.string().datetime().optional(),
});

export const GET = withApiHandler(async ({ request, requestId }) => {
  const actor = await getCurrentActor();
  if (!actor) throw errors.unauthorized();
  if (!authorizationService.hasPermission(actor, PERMISSIONS.CRM_ACTIVITIES_READ)) {
    throw errors.forbidden();
  }

  const url = new URL(request.url);
  const type = url.searchParams.get("type") ?? "";
  const contactId = url.searchParams.get("contactId") ?? "";
  const dealId = url.searchParams.get("dealId") ?? "";
  const page = Math.max(1, Number(url.searchParams.get("page") ?? "1"));
  const pageSize = Math.min(50, Math.max(1, Number(url.searchParams.get("pageSize") ?? "20")));

  const where: Record<string, unknown> = tenantWhere(actor);
  if (type) where.type = type;
  if (contactId) where.contactId = contactId;
  if (dealId) where.dealId = dealId;

  const [activities, total] = await Promise.all([
    prisma.activity.findMany({
      where,
      include: {
        contact: { select: { id: true, firstName: true, lastName: true } },
        deal: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.activity.count({ where }),
  ]);

  return NextResponse.json({
    data: activities.map((a) => ({
      id: a.id,
      type: a.type,
      subject: a.subject,
      body: a.body,
      contact: a.contact,
      deal: a.deal,
      dueAt: a.dueAt?.toISOString() ?? null,
      completedAt: a.completedAt?.toISOString() ?? null,
      createdAt: a.createdAt.toISOString(),
    })),
    pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    requestId,
  });
});

export const POST = withApiHandler(async ({ request, requestId }) => {
  const actor = await getCurrentActor();
  if (!actor) throw errors.unauthorized();
  if (!authorizationService.hasPermission(actor, PERMISSIONS.CRM_ACTIVITIES_MANAGE)) {
    throw errors.forbidden();
  }

  const body = await request.json();
  const parsed = createActivitySchema.safeParse(body);
  if (!parsed.success) throw errors.forbidden("Invalid request body.");

  const activity = await prisma.activity.create({
    data: tenantCreate(actor, {
      type: parsed.data.type,
      subject: parsed.data.subject,
      body: parsed.data.body || null,
      contactId: parsed.data.contactId || null,
      dealId: parsed.data.dealId || null,
      dueAt: parsed.data.dueAt ? new Date(parsed.data.dueAt) : null,
    }),
  });

  await auditService.record({
    action: "crm.activity.created",
    actorId: actor.id,
    metadata: { type: activity.type, subject: activity.subject },
    requestId,
    resourceId: activity.id,
    resourceType: "crm.activity",
  });

  return NextResponse.json({ data: { id: activity.id }, requestId });
});
