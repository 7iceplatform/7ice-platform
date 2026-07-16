import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentActor } from "@/auth/current-actor";
import { PERMISSIONS } from "@/config/permissions";
import { prisma } from "@/server/db/prisma";
import { authorizationService } from "@/server/services/authorization-service";
import { auditService } from "@/server/services/audit-service";
import { notificationService } from "@/server/services/notification-service";
import { withApiHandler } from "@/lib/http/with-api-handler";
import { errors } from "@/lib/errors/app-error";

export const dynamic = "force-dynamic";

const updateDealSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  stage: z.enum(["NEW", "QUALIFIED", "PROPOSAL", "NEGOTIATION", "WON", "LOST"]).optional(),
  valueAmount: z.number().int().min(0).nullable().optional(),
  valueCurrency: z.string().length(3).optional(),
  contactId: z.string().nullable().optional(),
  companyId: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
});

export const GET = withApiHandler(async ({ params, requestId }) => {
  const actor = await getCurrentActor();
  if (!actor) throw errors.unauthorized();
  if (!authorizationService.hasPermission(actor, PERMISSIONS.CRM_DEALS_READ)) {
    throw errors.forbidden();
  }

  const dealId = params?.id;
  if (!dealId) throw errors.forbidden("Invalid deal ID.");

  const deal = await prisma.deal.findUnique({
    where: { id: dealId },
    include: {
      contact: { select: { id: true, firstName: true, lastName: true, email: true } },
      company: { select: { id: true, name: true } },
      activities: { orderBy: { createdAt: "desc" }, take: 10 },
    },
  });

  if (!deal) throw errors.forbidden("Deal not found.");

  return NextResponse.json({
    data: {
      id: deal.id,
      title: deal.title,
      stage: deal.stage,
      valueAmount: deal.valueAmount,
      valueCurrency: deal.valueCurrency,
      contact: deal.contact,
      company: deal.company,
      description: deal.description,
      activities: deal.activities.map((a) => ({
        id: a.id,
        type: a.type,
        subject: a.subject,
        body: a.body,
        dueAt: a.dueAt?.toISOString() ?? null,
        completedAt: a.completedAt?.toISOString() ?? null,
        createdAt: a.createdAt.toISOString(),
      })),
      createdAt: deal.createdAt.toISOString(),
      updatedAt: deal.updatedAt.toISOString(),
    },
    requestId,
  });
});

export const PATCH = withApiHandler(async ({ params, request, requestId }) => {
  const actor = await getCurrentActor();
  if (!actor) throw errors.unauthorized();
  if (!authorizationService.hasPermission(actor, PERMISSIONS.CRM_DEALS_MANAGE)) {
    throw errors.forbidden();
  }

  const dealId = params?.id;
  if (!dealId) throw errors.forbidden("Invalid deal ID.");

  const existing = await prisma.deal.findUnique({ where: { id: dealId } });
  if (!existing) throw errors.forbidden("Deal not found.");

  const body = await request.json();
  const parsed = updateDealSchema.safeParse(body);
  if (!parsed.success) throw errors.forbidden("Invalid request body.");

  const updated = await prisma.deal.update({
    where: { id: dealId },
    data: parsed.data,
  });

  if (parsed.data.stage && parsed.data.stage !== existing.stage) {
    await notificationService.dealStageChanged(
      { id: dealId, title: updated.title },
      existing.stage,
      parsed.data.stage,
    );
  }

  await auditService.record({
    action: "crm.deal.updated",
    actorId: actor.id,
    metadata: { title: updated.title, stage: updated.stage, fields: Object.keys(parsed.data) },
    requestId,
    resourceId: dealId,
    resourceType: "crm.deal",
  });

  return NextResponse.json({ success: true, requestId });
});

export const DELETE = withApiHandler(async ({ params, requestId }) => {
  const actor = await getCurrentActor();
  if (!actor) throw errors.unauthorized();
  if (!authorizationService.hasPermission(actor, PERMISSIONS.CRM_DEALS_MANAGE)) {
    throw errors.forbidden();
  }

  const dealId = params?.id;
  if (!dealId) throw errors.forbidden("Invalid deal ID.");

  const existing = await prisma.deal.findUnique({ where: { id: dealId } });
  if (!existing) throw errors.forbidden("Deal not found.");

  await prisma.deal.delete({ where: { id: dealId } });

  await auditService.record({
    action: "crm.deal.deleted",
    actorId: actor.id,
    metadata: { title: existing.title },
    requestId,
    resourceId: dealId,
    resourceType: "crm.deal",
  });

  return NextResponse.json({ success: true, requestId });
});
