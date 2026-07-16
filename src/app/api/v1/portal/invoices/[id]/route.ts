import { NextResponse } from "next/server";

import { getCurrentActor } from "@/auth/current-actor";
import { prisma } from "@/server/db/prisma";
import { withApiHandler } from "@/lib/http/with-api-handler";
import { errors } from "@/lib/errors/app-error";

export const dynamic = "force-dynamic";

export const GET = withApiHandler(async ({ params, requestId }) => {
  const actor = await getCurrentActor();
  if (!actor) throw errors.unauthorized();

  const user = await prisma.user.findUnique({ where: { id: actor.id } });
  if (!user) throw errors.unauthorized();

  const invoiceId = params?.id;
  if (!invoiceId) throw errors.forbidden("Invalid invoice ID.");

  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      contact: true,
      company: true,
      payments: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!invoice) throw errors.forbidden("Invoice not found.");
  if (invoice.contact?.email !== user.email) throw errors.forbidden("Access denied.");

  return NextResponse.json({
    data: {
      id: invoice.id,
      number: invoice.invoiceNumber,
      status: invoice.status,
      amountCents: invoice.amountCents,
      taxCents: invoice.taxCents,
      totalCents: invoice.amountCents + invoice.taxCents,
      currency: invoice.currency,
      description: invoice.description,
      contactName: invoice.contact ? `${invoice.contact.firstName} ${invoice.contact.lastName ?? ""}`.trim() : null,
      companyName: invoice.company?.name ?? null,
      issuedAt: invoice.issuedAt?.toISOString() ?? null,
      dueAt: invoice.dueAt?.toISOString() ?? null,
      paidAt: invoice.paidAt?.toISOString() ?? null,
      createdAt: invoice.createdAt.toISOString(),
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
