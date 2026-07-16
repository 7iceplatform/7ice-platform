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

const createLeadSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().max(100).optional(),
  email: z.string().email().optional(),
  phone: z.string().max(30).optional(),
  company: z.string().max(200).optional(),
  source: z.enum(["WEBSITE", "REFERRAL", "ADVERTISEMENT", "SOCIAL_MEDIA", "TRADE_SHOW", "COLD_CALL", "OTHER"]).optional(),
  campaign: z.string().max(200).optional(),
  utmSource: z.string().max(200).optional(),
  utmMedium: z.string().max(200).optional(),
  utmCampaign: z.string().max(200).optional(),
  notes: z.string().max(2000).optional(),
});

export const GET = withApiHandler(async ({ request, requestId }) => {
  const actor = await getCurrentActor();
  if (!actor) throw errors.unauthorized();
  if (!authorizationService.hasPermission(actor, PERMISSIONS.CRM_LEADS_READ)) throw errors.forbidden();

  const url = new URL(request.url);
  const status = url.searchParams.get("status") ?? "";
  const search = url.searchParams.get("search") ?? "";
  const page = Math.max(1, Number(url.searchParams.get("page") ?? "1"));
  const pageSize = Math.min(50, Math.max(1, Number(url.searchParams.get("pageSize") ?? "20")));

  const where: Record<string, unknown> = tenantWhere(actor);
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { firstName: { contains: search, mode: "insensitive" } },
      { lastName: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { company: { contains: search, mode: "insensitive" } },
    ];
  }

  const [leads, total] = await Promise.all([
    prisma.lead.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.lead.count({ where }),
  ]);

  return NextResponse.json({
    data: leads.map((l) => ({
      id: l.id,
      firstName: l.firstName,
      lastName: l.lastName,
      email: l.email,
      phone: l.phone,
      company: l.company,
      source: l.source,
      status: l.status,
      campaign: l.campaign,
      notes: l.notes,
      discardedReason: l.discardedReason,
      createdAt: l.createdAt.toISOString(),
    })),
    pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    requestId,
  });
});

export const POST = withApiHandler(async ({ request, requestId }) => {
  const actor = await getCurrentActor();
  if (!actor) throw errors.unauthorized();
  if (!authorizationService.hasPermission(actor, PERMISSIONS.CRM_LEADS_MANAGE)) throw errors.forbidden();

  const body = await request.json();
  const parsed = createLeadSchema.safeParse(body);
  if (!parsed.success) throw errors.forbidden("Invalid request body.");

  const lead = await prisma.lead.create({
    data: tenantCreate(actor, {
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName || null,
      email: parsed.data.email || null,
      phone: parsed.data.phone || null,
      company: parsed.data.company || null,
      source: parsed.data.source ?? "WEBSITE",
      campaign: parsed.data.campaign || null,
      utmSource: parsed.data.utmSource || null,
      utmMedium: parsed.data.utmMedium || null,
      utmCampaign: parsed.data.utmCampaign || null,
      notes: parsed.data.notes || null,
    }),
  });

  await auditService.record({
    action: "lead.created",
    actorId: actor.id,
    metadata: { source: lead.source, firstName: lead.firstName },
    requestId,
    resourceId: lead.id,
    resourceType: "lead",
  });

  return NextResponse.json({ data: { id: lead.id }, requestId });
});
