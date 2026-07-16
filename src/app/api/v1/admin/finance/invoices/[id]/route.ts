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

const updateInvoiceSchema = z.object({
  contactId: z.string().optional(),
  companyId: z.string().optional(),
  workOrderId: z.string().optional(),
  amountCents: z.number().int().positive().optional(),
  taxCents: z.number().int().min(0).optional(),
  description: z.string().optional(),
  dueAt: z.string().optional(),
});

export const GET = withApiHandler(async ({ params, requestId }) => {
  const actor = await getCurrentActor();
  if (!actor) throw errors.unauthorized();
  if (!authorizationService.hasPermission(actor, PERMISSIONS.FINANCE_INVOICES_READ)) {
    throw errors.forbidden();
  }

  const invoiceId = params?.id;
  if (!invoiceId) throw errors.forbidden("Invalid invoice ID.");

  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: { contact: true, company: true, workOrder: true, payments: { orderBy: { createdAt: "desc" } } },
  });
  if (!invoice) throw errors.forbidden("Invoice not found.");

  return NextResponse.json({
    data: {
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      status: invoice.status,
      contactId: invoice.contactId,
      contactName: invoice.contact ? `${invoice.contact.firstName} ${invoice.contact.lastName ?? ""}`.trim() : null,
      companyId: invoice.companyId,
      companyName: invoice.company?.name ?? null,
      workOrderId: invoice.workOrderId,
      workOrderNumber: invoice.workOrder?.workOrderNumber ?? null,
      amountCents: invoice.amountCents,
      taxCents: invoice.taxCents,
      totalCents: invoice.amountCents + invoice.taxCents,
      currency: invoice.currency,
      description: invoice.description,
      issuedAt: invoice.issuedAt?.toISOString() ?? null,
      dueAt: invoice.dueAt?.toISOString() ?? null,
      paidAt: invoice.paidAt?.toISOString() ?? null,
      createdAt: invoice.createdAt.toISOString(),
      updatedAt: invoice.updatedAt.toISOString(),
      payments: invoice.payments.map((p) => ({
        id: p.id,
        amountCents: p.amountCents,
        method: p.method,
        status: p.status,
        reference: p.reference,
        settledAt: p.settledAt?.toISOString() ?? null,
        createdAt: p.createdAt.toISOString(),
      })),
    },
    requestId,
  });
});

export const PATCH = withApiHandler(async ({ params, request, requestId }) => {
  const actor = await getCurrentActor();
  if (!actor) throw errors.unauthorized();
  if (!authorizationService.hasPermission(actor, PERMISSIONS.FINANCE_INVOICES_MANAGE)) {
    throw errors.forbidden();
  }

  const invoiceId = params?.id;
  if (!invoiceId) throw errors.forbidden("Invalid invoice ID.");

  const body = await request.json();
  const parsed = updateInvoiceSchema.safeParse(body);
  if (!parsed.success) throw errors.forbidden("Invalid request body.");

  const d = parsed.data;

  const existing = await prisma.invoice.findUnique({ where: { id: invoiceId } });
  if (!existing) throw errors.forbidden("Invoice not found.");
  if (existing.status === "PAID" || existing.status === "CANCELLED") {
    throw errors.forbidden("Cannot edit paid or cancelled invoices.");
  }

  const invoice = await prisma.invoice.update({
    where: { id: invoiceId },
    data: {
      ...(d.contactId !== undefined && { contactId: d.contactId || null }),
      ...(d.companyId !== undefined && { companyId: d.companyId || null }),
      ...(d.workOrderId !== undefined && { workOrderId: d.workOrderId || null }),
      ...(d.amountCents !== undefined && { amountCents: d.amountCents }),
      ...(d.taxCents !== undefined && { taxCents: d.taxCents }),
      ...(d.description !== undefined && { description: d.description || null }),
      ...(d.dueAt !== undefined && { dueAt: d.dueAt ? new Date(d.dueAt) : null }),
    },
  });

  await auditService.record({
    action: "invoice.updated",
    actorId: actor.id,
    metadata: { number: invoice.invoiceNumber },
    requestId,
    resourceId: invoiceId,
    resourceType: "invoice",
  });

  return NextResponse.json({ success: true, requestId });
});

export const DELETE = withApiHandler(async ({ params, requestId }) => {
  const actor = await getCurrentActor();
  if (!actor) throw errors.unauthorized();
  if (!authorizationService.hasPermission(actor, PERMISSIONS.FINANCE_INVOICES_MANAGE)) {
    throw errors.forbidden();
  }

  const invoiceId = params?.id;
  if (!invoiceId) throw errors.forbidden("Invalid invoice ID.");

  const existing = await prisma.invoice.findUnique({ where: { id: invoiceId } });
  if (!existing) throw errors.forbidden("Invoice not found.");
  if (existing.status !== "DRAFT") throw errors.forbidden("Only draft invoices can be deleted.");

  await prisma.payment.deleteMany({ where: { invoiceId } });
  await prisma.invoice.delete({ where: { id: invoiceId } });

  await auditService.record({
    action: "invoice.deleted",
    actorId: actor.id,
    metadata: { number: existing.invoiceNumber },
    requestId,
    resourceId: invoiceId,
    resourceType: "invoice",
  });

  return NextResponse.json({ success: true, requestId });
});
