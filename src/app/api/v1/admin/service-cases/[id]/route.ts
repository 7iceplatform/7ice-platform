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
  if (!authorizationService.hasPermission(actor, PERMISSIONS.SERVICE_CASES_READ)) {
    throw errors.forbidden();
  }

  const serviceCase = await prisma.serviceCase.findUnique({
    where: { id: params?.id },
    include: {
      contact: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
      company: { select: { id: true, name: true } },
      workOrder: { select: { id: true, workOrderNumber: true, status: true, type: true } },
      logs: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!serviceCase) throw errors.notFound("Service case not found.");

  return NextResponse.json({
    data: {
      id: serviceCase.id,
      caseNumber: serviceCase.caseNumber,
      type: serviceCase.type,
      severity: serviceCase.severity,
      status: serviceCase.status,
      title: serviceCase.title,
      description: serviceCase.description,
      contact: serviceCase.contact,
      company: serviceCase.company,
      workOrder: serviceCase.workOrder,
      resolution: serviceCase.resolution,
      cause: serviceCase.cause,
      resolvedAt: serviceCase.resolvedAt?.toISOString() ?? null,
      closedAt: serviceCase.closedAt?.toISOString() ?? null,
      createdAt: serviceCase.createdAt.toISOString(),
      logs: serviceCase.logs.map((log) => ({
        id: log.id,
        status: log.status,
        note: log.note,
        actorId: log.actorId,
        createdAt: log.createdAt.toISOString(),
      })),
    },
    requestId,
  });
});

export const PATCH = withApiHandler(async ({ request, params, requestId }) => {
  const actor = await getCurrentActor();
  if (!actor) throw errors.unauthorized();
  if (!authorizationService.hasPermission(actor, PERMISSIONS.SERVICE_CASES_MANAGE)) {
    throw errors.forbidden();
  }

  const body = await request.json();
  const existing = await prisma.serviceCase.findUnique({ where: { id: params?.id } });
  if (!existing) throw errors.notFound("Service case not found.");

  if (existing.status === "CLOSED") {
    throw errors.conflict("Cannot edit a closed service case.");
  }

  const updated = await prisma.serviceCase.update({
    where: { id: params?.id },
    data: {
      ...(body.title && { title: body.title }),
      ...(body.description && { description: body.description }),
      ...(body.severity && { severity: body.severity }),
      ...(body.resolution && { resolution: body.resolution }),
      ...(body.cause && { cause: body.cause }),
      ...(body.contactId !== undefined && { contactId: body.contactId || null }),
      ...(body.companyId !== undefined && { companyId: body.companyId || null }),
    },
  });

  await auditService.record({
    action: "service_case.updated",
    actorId: actor.id,
    metadata: { changes: Object.keys(body) },
    requestId,
    resourceId: existing.id,
    resourceType: "service_case",
  });

  return NextResponse.json({ data: { id: updated.id }, requestId });
});
