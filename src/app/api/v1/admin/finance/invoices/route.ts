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

const createInvoiceSchema = z.object({
  contactId: z.string().optional(),
  companyId: z.string().optional(),
  workOrderId: z.string().optional(),
  amountCents: z.number().int().positive(),
  taxCents: z.number().int().min(0).optional(),
  currency: z.string().length(3).optional(),
  description: z.string().optional(),
  dueAt: z.string().optional(),
});

export const GET = withApiHandler(async ({ request, requestId }) => {
  const actor = await getCurrentActor();
  if (!actor) throw errors.unauthorized();
  if (!authorizationService.hasPermission(actor, PERMISSIONS.FINANCE_INVOICES_READ)) {
    throw errors.forbidden();
  }

  const url = new URL(request.url);
  const status = url.searchParams.get("status") ?? "";
  const page = Math.max(1, Number(url.searchParams.get("page") ?? "1"));
  const pageSize = Math.min(50, Math.max(1, Number(url.searchParams.get("pageSize") ?? "20")));

  const where: Record<string, unknown> = tenantWhere(actor);
  if (status) where.status = status;

  const [invoices, total] = await Promise.all([
    prisma.invoice.findMany({
      where,
      include: { contact: true, company: true, workOrder: true, payments: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.invoice.count({ where }),
  ]);

  return NextResponse.json({
    data: invoices.map((inv) => ({
      id: inv.id,
      invoiceNumber: inv.invoiceNumber,
      status: inv.status,
      contactName: inv.contact ? `${inv.contact.firstName} ${inv.contact.lastName ?? ""}`.trim() : null,
      companyName: inv.company?.name ?? null,
      workOrderNumber: inv.workOrder?.workOrderNumber ?? null,
      amountCents: inv.amountCents,
      taxCents: inv.taxCents,
      currency: inv.currency,
      totalCents: inv.amountCents + inv.taxCents,
      description: inv.description,
      issuedAt: inv.issuedAt?.toISOString() ?? null,
      dueAt: inv.dueAt?.toISOString() ?? null,
      paidAt: inv.paidAt?.toISOString() ?? null,
      paidAmountCents: inv.payments.filter((p) => p.status === "SETTLED").reduce((sum, p) => sum + p.amountCents, 0),
      createdAt: inv.createdAt.toISOString(),
    })),
    pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    requestId,
  });
});

export const POST = withApiHandler(async ({ request, requestId }) => {
  const actor = await getCurrentActor();
  if (!actor) throw errors.unauthorized();
  if (!authorizationService.hasPermission(actor, PERMISSIONS.FINANCE_INVOICES_MANAGE)) {
    throw errors.forbidden();
  }

  const body = await request.json();
  const parsed = createInvoiceSchema.safeParse(body);
  if (!parsed.success) throw errors.forbidden("Invalid request body.");

  const d = parsed.data;

  const maxNumber = await prisma.invoice.aggregate({ _max: { invoiceNumber: true } });
  const nextNumber = (maxNumber._max.invoiceNumber ?? 0) + 1;

  const invoice = await prisma.invoice.create({
    data: tenantCreate(actor, {
      invoiceNumber: nextNumber,
      contactId: d.contactId || null,
      companyId: d.companyId || null,
      workOrderId: d.workOrderId || null,
      amountCents: d.amountCents,
      taxCents: d.taxCents ?? 0,
      currency: d.currency ?? "RUB",
      description: d.description || null,
      dueAt: d.dueAt ? new Date(d.dueAt) : null,
    }),
  });

  await auditService.record({
    action: "invoice.created",
    actorId: actor.id,
    metadata: { number: nextNumber, amountCents: d.amountCents },
    requestId,
    resourceId: invoice.id,
    resourceType: "invoice",
  });

  return NextResponse.json({ data: { id: invoice.id, invoiceNumber: nextNumber }, requestId });
});
