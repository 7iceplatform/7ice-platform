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

const createDealSchema = z.object({
  title: z.string().min(1).max(500),
  stage: z.enum(["NEW", "QUALIFIED", "PROPOSAL", "NEGOTIATION", "WON", "LOST"]).optional(),
  valueAmount: z.number().int().min(0).optional(),
  valueCurrency: z.string().length(3).optional(),
  contactId: z.string().optional(),
  companyId: z.string().optional(),
  description: z.string().optional(),
});

export const GET = withApiHandler(async ({ request, requestId }) => {
  const actor = await getCurrentActor();
  if (!actor) throw errors.unauthorized();
  if (!authorizationService.hasPermission(actor, PERMISSIONS.CRM_DEALS_READ)) {
    throw errors.forbidden();
  }

  const url = new URL(request.url);
  const search = url.searchParams.get("search") ?? "";
  const stage = url.searchParams.get("stage") ?? "";
  const page = Math.max(1, Number(url.searchParams.get("page") ?? "1"));
  const pageSize = Math.min(50, Math.max(1, Number(url.searchParams.get("pageSize") ?? "20")));

  const where: Record<string, unknown> = tenantWhere(actor);
  if (search) {
    where.OR = [{ title: { contains: search, mode: "insensitive" } }];
  }
  if (stage) {
    where.stage = stage;
  }

  const [deals, total] = await Promise.all([
    prisma.deal.findMany({
      where,
      include: {
        contact: { select: { id: true, firstName: true, lastName: true } },
        company: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.deal.count({ where }),
  ]);

  return NextResponse.json({
    data: deals.map((d) => ({
      id: d.id,
      title: d.title,
      stage: d.stage,
      valueAmount: d.valueAmount,
      valueCurrency: d.valueCurrency,
      contact: d.contact,
      company: d.company,
      description: d.description,
      createdAt: d.createdAt.toISOString(),
    })),
    pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    requestId,
  });
});

export const POST = withApiHandler(async ({ request, requestId }) => {
  const actor = await getCurrentActor();
  if (!actor) throw errors.unauthorized();
  if (!authorizationService.hasPermission(actor, PERMISSIONS.CRM_DEALS_MANAGE)) {
    throw errors.forbidden();
  }

  const body = await request.json();
  const parsed = createDealSchema.safeParse(body);

  if (!parsed.success) throw errors.forbidden("Invalid request body.");

  const deal = await prisma.deal.create({
    data: tenantCreate(actor, {
      title: parsed.data.title,
      stage: parsed.data.stage ?? "NEW",
      valueAmount: parsed.data.valueAmount,
      valueCurrency: parsed.data.valueCurrency,
      contactId: parsed.data.contactId || null,
      companyId: parsed.data.companyId || null,
      description: parsed.data.description || null,
    }),
  });

  await auditService.record({
    action: "crm.deal.created",
    actorId: actor.id,
    metadata: { title: deal.title, stage: deal.stage },
    requestId,
    resourceId: deal.id,
    resourceType: "crm.deal",
  });

  return NextResponse.json({ data: { id: deal.id }, requestId });
});
