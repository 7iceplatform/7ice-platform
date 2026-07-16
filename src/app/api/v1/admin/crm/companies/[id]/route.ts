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

const updateCompanySchema = z.object({
  name: z.string().min(1).max(500).optional(),
  industry: z.string().max(200).nullable().optional(),
  website: z.string().url().nullable().optional(),
  phone: z.string().max(50).nullable().optional(),
  address: z.string().max(500).nullable().optional(),
});

export const GET = withApiHandler(async ({ params, requestId }) => {
  const actor = await getCurrentActor();
  if (!actor) throw errors.unauthorized();
  if (!authorizationService.hasPermission(actor, PERMISSIONS.CRM_COMPANIES_READ)) {
    throw errors.forbidden();
  }

  const companyId = params?.id;
  if (!companyId) throw errors.forbidden("Invalid company ID.");

  const company = await prisma.company.findUnique({
    where: { id: companyId },
    include: {
      contacts: { orderBy: { firstName: "asc" } },
      deals: { orderBy: { createdAt: "desc" }, take: 10 },
    },
  });

  if (!company) throw errors.forbidden("Company not found.");

  return NextResponse.json({
    data: {
      id: company.id,
      name: company.name,
      industry: company.industry,
      website: company.website,
      phone: company.phone,
      address: company.address,
      contacts: company.contacts.map((c) => ({
        id: c.id,
        firstName: c.firstName,
        lastName: c.lastName,
        email: c.email,
        position: c.position,
      })),
      deals: company.deals.map((d) => ({
        id: d.id,
        title: d.title,
        stage: d.stage,
        valueAmount: d.valueAmount,
        valueCurrency: d.valueCurrency,
        createdAt: d.createdAt.toISOString(),
      })),
      createdAt: company.createdAt.toISOString(),
    },
    requestId,
  });
});

export const PATCH = withApiHandler(async ({ params, request, requestId }) => {
  const actor = await getCurrentActor();
  if (!actor) throw errors.unauthorized();
  if (!authorizationService.hasPermission(actor, PERMISSIONS.CRM_COMPANIES_MANAGE)) {
    throw errors.forbidden();
  }

  const companyId = params?.id;
  if (!companyId) throw errors.forbidden("Invalid company ID.");

  const existing = await prisma.company.findUnique({ where: { id: companyId } });
  if (!existing) throw errors.forbidden("Company not found.");

  const body = await request.json();
  const parsed = updateCompanySchema.safeParse(body);
  if (!parsed.success) throw errors.forbidden("Invalid request body.");

  const updated = await prisma.company.update({
    where: { id: companyId },
    data: parsed.data,
  });

  await auditService.record({
    action: "crm.company.updated",
    actorId: actor.id,
    metadata: { name: updated.name, fields: Object.keys(parsed.data) },
    requestId,
    resourceId: companyId,
    resourceType: "crm.company",
  });

  return NextResponse.json({ success: true, requestId });
});

export const DELETE = withApiHandler(async ({ params, requestId }) => {
  const actor = await getCurrentActor();
  if (!actor) throw errors.unauthorized();
  if (!authorizationService.hasPermission(actor, PERMISSIONS.CRM_COMPANIES_MANAGE)) {
    throw errors.forbidden();
  }

  const companyId = params?.id;
  if (!companyId) throw errors.forbidden("Invalid company ID.");

  const existing = await prisma.company.findUnique({
    where: { id: companyId },
    include: { _count: { select: { contacts: true, deals: true } } },
  });
  if (!existing) throw errors.forbidden("Company not found.");

  if (existing._count.contacts > 0 || existing._count.deals > 0) {
    throw errors.forbidden("Cannot delete company with associated contacts or deals.");
  }

  await prisma.company.delete({ where: { id: companyId } });

  await auditService.record({
    action: "crm.company.deleted",
    actorId: actor.id,
    metadata: { name: existing.name },
    requestId,
    resourceId: companyId,
    resourceType: "crm.company",
  });

  return NextResponse.json({ success: true, requestId });
});
