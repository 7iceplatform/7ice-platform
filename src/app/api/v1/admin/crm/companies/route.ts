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

const createCompanySchema = z.object({
  name: z.string().min(1).max(500),
  industry: z.string().max(200).optional(),
  website: z.string().url().optional().or(z.literal("")),
  phone: z.string().max(50).optional(),
  address: z.string().max(500).optional(),
});

export const GET = withApiHandler(async ({ request, requestId }) => {
  const actor = await getCurrentActor();
  if (!actor) throw errors.unauthorized();
  if (!authorizationService.hasPermission(actor, PERMISSIONS.CRM_COMPANIES_READ)) {
    throw errors.forbidden();
  }

  const url = new URL(request.url);
  const search = url.searchParams.get("search") ?? "";
  const page = Math.max(1, Number(url.searchParams.get("page") ?? "1"));
  const pageSize = Math.min(50, Math.max(1, Number(url.searchParams.get("pageSize") ?? "20")));

  const where: Record<string, unknown> = tenantWhere(actor);
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { industry: { contains: search, mode: "insensitive" } },
    ];
  }

  const [companies, total] = await Promise.all([
    prisma.company.findMany({
      where,
      include: {
        _count: { select: { contacts: true, deals: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.company.count({ where }),
  ]);

  return NextResponse.json({
    data: companies.map((c) => ({
      id: c.id,
      name: c.name,
      industry: c.industry,
      website: c.website,
      phone: c.phone,
      address: c.address,
      contactsCount: c._count.contacts,
      dealsCount: c._count.deals,
      createdAt: c.createdAt.toISOString(),
    })),
    pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    requestId,
  });
});

export const POST = withApiHandler(async ({ request, requestId }) => {
  const actor = await getCurrentActor();
  if (!actor) throw errors.unauthorized();
  if (!authorizationService.hasPermission(actor, PERMISSIONS.CRM_COMPANIES_MANAGE)) {
    throw errors.forbidden();
  }

  const body = await request.json();
  const parsed = createCompanySchema.safeParse(body);

  if (!parsed.success) throw errors.forbidden("Invalid request body.");

  const company = await prisma.company.create({
    data: tenantCreate(actor, {
      name: parsed.data.name,
      industry: parsed.data.industry || null,
      website: parsed.data.website || null,
      phone: parsed.data.phone || null,
      address: parsed.data.address || null,
    }),
  });

  await auditService.record({
    action: "crm.company.created",
    actorId: actor.id,
    metadata: { name: company.name },
    requestId,
    resourceId: company.id,
    resourceType: "crm.company",
  });

  return NextResponse.json({ data: { id: company.id }, requestId });
});
