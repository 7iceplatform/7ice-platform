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

const VALID_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ["ISSUED", "CANCELLED"],
  ISSUED: ["PAID", "OVERDUE", "CANCELLED"],
  PAID: [],
  OVERDUE: ["PAID", "CANCELLED"],
  CANCELLED: [],
};

const transitionSchema = z.object({
  status: z.enum(["DRAFT", "ISSUED", "PAID", "OVERDUE", "CANCELLED"]),
  note: z.string().optional(),
});

export const POST = withApiHandler(async ({ params, request, requestId }) => {
  const actor = await getCurrentActor();
  if (!actor) throw errors.unauthorized();
  if (!authorizationService.hasPermission(actor, PERMISSIONS.FINANCE_INVOICES_MANAGE)) {
    throw errors.forbidden();
  }

  const invoiceId = params?.id;
  if (!invoiceId) throw errors.forbidden("Invalid invoice ID.");

  const body = await request.json();
  const parsed = transitionSchema.safeParse(body);
  if (!parsed.success) throw errors.forbidden("Invalid status transition.");

  const existing = await prisma.invoice.findUnique({ where: { id: invoiceId } });
  if (!existing) throw errors.forbidden("Invoice not found.");

  const allowed = VALID_TRANSITIONS[existing.status] ?? [];
  if (!allowed.includes(parsed.data.status)) {
    throw errors.forbidden(`Cannot transition from ${existing.status} to ${parsed.data.status}.`);
  }

  const updateData: Record<string, unknown> = { status: parsed.data.status };
  if (parsed.data.status === "ISSUED") {
    updateData.issuedAt = new Date();
  }
  if (parsed.data.status === "PAID") {
    updateData.paidAt = new Date();
  }

  const invoice = await prisma.invoice.update({
    where: { id: invoiceId },
    data: updateData,
  });

  await auditService.record({
    action: "invoice.status_changed",
    actorId: actor.id,
    metadata: { from: existing.status, to: parsed.data.status, number: invoice.invoiceNumber },
    requestId,
    resourceId: invoiceId,
    resourceType: "invoice",
  });

  if (parsed.data.status === "ISSUED") {
    await notificationService.invoiceIssued({
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      amountCents: invoice.amountCents,
      taxCents: invoice.taxCents,
    });
  }

  if (parsed.data.status === "PAID") {
    await notificationService.invoicePaid({
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
    });
  }

  return NextResponse.json({ success: true, requestId });
});
