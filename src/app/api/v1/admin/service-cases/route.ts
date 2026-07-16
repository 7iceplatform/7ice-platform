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
import { tenantWhere, tenantCreate } from "@/lib/tenant-scope";

export const dynamic = "force-dynamic";

const createCaseSchema = z.object({
  type: z.enum(["INCIDENT", "REQUEST", "MAINTENANCE", "WARRANTY", "COMPLAINT"]),
  severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
  title: z.string().min(1).max(500),
  description: z.string().optional(),
  contactId: z.string().optional(),
  companyId: z.string().optional(),
});

export const GET = withApiHandler(async ({ request, requestId }) => {
  const actor = await getCurrentActor();
  if (!actor) throw errors.unauthorized();
  if (!authorizationService.hasPermission(actor, PERMISSIONS.SERVICE_CASES_READ)) {
    throw errors.forbidden();
  }

  const url = new URL(request.url);
  const status = url.searchParams.get("status") ?? "";
  const type = url.searchParams.get("type") ?? "";
  const search = url.searchParams.get("search") ?? "";
  const page = Math.max(1, Number(url.searchParams.get("page") ?? "1"));
  const pageSize = Math.min(50, Math.max(1, Number(url.searchParams.get("pageSize") ?? "20")));

  const where: Record<string, unknown> = tenantWhere(actor);
  if (status) where.status = status;
  if (type) where.type = type;
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  const [cases, total] = await Promise.all([
    prisma.serviceCase.findMany({
      where,
      include: {
        contact: { select: { id: true, firstName: true, lastName: true } },
        company: { select: { id: true, name: true } },
        workOrder: { select: { id: true, workOrderNumber: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.serviceCase.count({ where }),
  ]);

  return NextResponse.json({
    data: cases.map((c) => ({
      id: c.id,
      caseNumber: c.caseNumber,
      type: c.type,
      severity: c.severity,
      status: c.status,
      title: c.title,
      contact: c.contact,
      company: c.company,
      workOrderNumber: c.workOrder?.workOrderNumber ?? null,
      resolvedAt: c.resolvedAt?.toISOString() ?? null,
      closedAt: c.closedAt?.toISOString() ?? null,
      createdAt: c.createdAt.toISOString(),
    })),
    pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    requestId,
  });
});

export const POST = withApiHandler(async ({ request, requestId }) => {
  const actor = await getCurrentActor();
  if (!actor) throw errors.unauthorized();
  if (!authorizationService.hasPermission(actor, PERMISSIONS.SERVICE_CASES_MANAGE)) {
    throw errors.forbidden();
  }

  const body = await request.json();
  const parsed = createCaseSchema.safeParse(body);
  if (!parsed.success) throw errors.forbidden("Invalid request body.");

  const serviceCase = await prisma.serviceCase.create({
    data: tenantCreate(actor, {
      type: parsed.data.type,
      severity: parsed.data.severity ?? "MEDIUM",
      title: parsed.data.title,
      description: parsed.data.description || null,
      contactId: parsed.data.contactId || null,
      companyId: parsed.data.companyId || null,
    }),
  });

  await prisma.serviceCaseLog.create({
    data: {
      serviceCaseId: serviceCase.id,
      status: "NEW",
      note: "Case created",
      actorId: actor.id,
    },
  });

  await auditService.record({
    action: "service_case.created",
    actorId: actor.id,
    metadata: { caseNumber: serviceCase.caseNumber, type: serviceCase.type, severity: serviceCase.severity },
    requestId,
    resourceId: serviceCase.id,
    resourceType: "service_case",
  });

  await notificationService.create({
    title: `Service case #${serviceCase.caseNumber}`,
    body: `New ${serviceCase.type.toLowerCase()} case: ${serviceCase.title}`,
    referenceType: "service_case",
    referenceId: serviceCase.id,
  });

  return NextResponse.json({ data: { id: serviceCase.id, caseNumber: serviceCase.caseNumber }, requestId });
});
