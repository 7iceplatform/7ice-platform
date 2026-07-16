import { NextResponse } from "next/server";

import { getCurrentActor } from "@/auth/current-actor";
import { PERMISSIONS } from "@/config/permissions";
import { prisma } from "@/server/db/prisma";
import { authorizationService } from "@/server/services/authorization-service";
import { auditService } from "@/server/services/audit-service";
import { withApiHandler } from "@/lib/http/with-api-handler";
import { errors } from "@/lib/errors/app-error";

export const dynamic = "force-dynamic";

export const GET = withApiHandler(async ({ params, requestId }) => {
  const actor = await getCurrentActor();
  if (!actor) throw errors.unauthorized();
  if (!authorizationService.hasPermission(actor, PERMISSIONS.CRM_LEADS_READ)) throw errors.forbidden();

  const lead = await prisma.lead.findUnique({
    where: { id: params?.id },
    include: { consents: true },
  });

  if (!lead) throw errors.notFound("Lead not found.");

  return NextResponse.json({
    data: {
      ...lead,
      createdAt: lead.createdAt.toISOString(),
      updatedAt: lead.updatedAt.toISOString(),
      consents: lead.consents.map((c) => ({
        ...c,
        capturedAt: c.capturedAt.toISOString(),
        withdrawnAt: c.withdrawnAt?.toISOString() ?? null,
        expiresAt: c.expiresAt?.toISOString() ?? null,
        createdAt: c.createdAt.toISOString(),
      })),
    },
    requestId,
  });
});

export const PATCH = withApiHandler(async ({ request, params, requestId }) => {
  const actor = await getCurrentActor();
  if (!actor) throw errors.unauthorized();
  if (!authorizationService.hasPermission(actor, PERMISSIONS.CRM_LEADS_MANAGE)) throw errors.forbidden();

  const existing = await prisma.lead.findUnique({ where: { id: params?.id } });
  if (!existing) throw errors.notFound("Lead not found.");

  const body = await request.json();
  const updated = await prisma.lead.update({
    where: { id: params?.id },
    data: {
      ...(body.firstName && { firstName: body.firstName }),
      ...(body.lastName !== undefined && { lastName: body.lastName || null }),
      ...(body.email !== undefined && { email: body.email || null }),
      ...(body.phone !== undefined && { phone: body.phone || null }),
      ...(body.company !== undefined && { company: body.company || null }),
      ...(body.status && { status: body.status }),
      ...(body.notes !== undefined && { notes: body.notes || null }),
      ...(body.discardedReason !== undefined && { discardedReason: body.discardedReason || null }),
    },
  });

  await auditService.record({
    action: "lead.updated",
    actorId: actor.id,
    metadata: { changes: Object.keys(body) },
    requestId,
    resourceId: existing.id,
    resourceType: "lead",
  });

  return NextResponse.json({ data: { id: updated.id, status: updated.status }, requestId });
});

export const DELETE = withApiHandler(async ({ params, requestId }) => {
  const actor = await getCurrentActor();
  if (!actor) throw errors.unauthorized();
  if (!authorizationService.hasPermission(actor, PERMISSIONS.CRM_LEADS_MANAGE)) throw errors.forbidden();

  const existing = await prisma.lead.findUnique({ where: { id: params?.id } });
  if (!existing) throw errors.notFound("Lead not found.");
  if (existing.status === "CONVERTED") {
    throw errors.conflict("Cannot delete a converted lead.");
  }

  await prisma.lead.delete({ where: { id: params?.id } });

  await auditService.record({
    action: "lead.deleted",
    actorId: actor.id,
    metadata: { firstName: existing.firstName },
    requestId,
    resourceId: existing.id,
    resourceType: "lead",
  });

  return NextResponse.json({ data: { id: existing.id }, requestId });
});
