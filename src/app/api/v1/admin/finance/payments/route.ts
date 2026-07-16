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

const createPaymentSchema = z.object({
  invoiceId: z.string().min(1),
  amountCents: z.number().int().positive(),
  method: z.enum(["CARD", "BANK_TRANSFER", "CASH", "ONLINE", "OTHER"]).optional(),
  reference: z.string().optional(),
  notes: z.string().optional(),
});

export const GET = withApiHandler(async ({ request, requestId }) => {
  const actor = await getCurrentActor();
  if (!actor) throw errors.unauthorized();
  if (!authorizationService.hasPermission(actor, PERMISSIONS.FINANCE_PAYMENTS_READ)) {
    throw errors.forbidden();
  }

  const url = new URL(request.url);
  const invoiceId = url.searchParams.get("invoiceId") ?? "";
  const status = url.searchParams.get("status") ?? "";
  const page = Math.max(1, Number(url.searchParams.get("page") ?? "1"));
  const pageSize = Math.min(50, Math.max(1, Number(url.searchParams.get("pageSize") ?? "20")));

  const where: Record<string, unknown> = {};
  if (invoiceId) where.invoiceId = invoiceId;
  if (status) where.status = status;

  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      include: { invoice: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.payment.count({ where }),
  ]);

  return NextResponse.json({
    data: payments.map((p) => ({
      id: p.id,
      invoiceId: p.invoiceId,
      invoiceNumber: p.invoice.invoiceNumber,
      amountCents: p.amountCents,
      method: p.method,
      status: p.status,
      reference: p.reference,
      notes: p.notes,
      settledAt: p.settledAt?.toISOString() ?? null,
      createdAt: p.createdAt.toISOString(),
    })),
    pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    requestId,
  });
});

export const POST = withApiHandler(async ({ request, requestId }) => {
  const actor = await getCurrentActor();
  if (!actor) throw errors.unauthorized();
  if (!authorizationService.hasPermission(actor, PERMISSIONS.FINANCE_PAYMENTS_MANAGE)) {
    throw errors.forbidden();
  }

  const body = await request.json();
  const parsed = createPaymentSchema.safeParse(body);
  if (!parsed.success) throw errors.forbidden("Invalid request body.");

  const d = parsed.data;

  const invoice = await prisma.invoice.findUnique({ where: { id: d.invoiceId } });
  if (!invoice) throw errors.forbidden("Invoice not found.");
  if (invoice.status === "DRAFT" || invoice.status === "CANCELLED") {
    throw errors.forbidden("Cannot record payment for draft or cancelled invoices.");
  }

  const payment = await prisma.payment.create({
    data: {
      invoiceId: d.invoiceId,
      amountCents: d.amountCents,
      method: d.method ?? "OTHER",
      reference: d.reference || null,
      notes: d.notes || null,
    },
  });

  await auditService.record({
    action: "payment.created",
    actorId: actor.id,
    metadata: { invoiceNumber: invoice.invoiceNumber, amountCents: d.amountCents, method: d.method },
    requestId,
    resourceId: payment.id,
    resourceType: "payment",
  });

  await notificationService.paymentReceived({
    id: payment.id,
    amountCents: d.amountCents,
    invoiceNumber: invoice.invoiceNumber,
  });

  return NextResponse.json({ data: { id: payment.id }, requestId });
});
