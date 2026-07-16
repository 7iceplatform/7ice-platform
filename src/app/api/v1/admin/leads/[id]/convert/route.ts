import { NextResponse } from "next/server";

import { getCurrentActor } from "@/auth/current-actor";
import { PERMISSIONS } from "@/config/permissions";
import { prisma } from "@/server/db/prisma";
import { authorizationService } from "@/server/services/authorization-service";
import { auditService } from "@/server/services/audit-service";
import { notificationService } from "@/server/services/notification-service";
import { withApiHandler } from "@/lib/http/with-api-handler";
import { errors } from "@/lib/errors/app-error";

export const dynamic = "force-dynamic";

export const POST = withApiHandler(async ({ params, requestId }) => {
  const actor = await getCurrentActor();
  if (!actor) throw errors.unauthorized();
  if (!authorizationService.hasPermission(actor, PERMISSIONS.CRM_LEADS_MANAGE)) throw errors.forbidden();

  const existing = await prisma.lead.findUnique({ where: { id: params?.id } });
  if (!existing) throw errors.notFound("Lead not found.");
  if (existing.status === "CONVERTED") throw errors.conflict("Lead is already converted.");
  if (existing.status === "DISCARDED") throw errors.conflict("Cannot convert a discarded lead.");

  const result = await prisma.$transaction(async (tx) => {
    const contact = await tx.contact.create({
      data: {
        firstName: existing.firstName,
        lastName: existing.lastName,
        email: existing.email,
        phone: existing.phone,
        position: null,
      },
    });

    const deal = await tx.deal.create({
      data: {
        title: `Deal from lead: ${existing.firstName} ${existing.lastName ?? ""}`.trim(),
        stage: "NEW",
        contactId: contact.id,
        description: `Converted from lead #${existing.id}. Source: ${existing.source}`,
      },
    });

    await tx.lead.update({
      where: { id: params?.id },
      data: {
        status: "CONVERTED",
        convertedContactId: contact.id,
        convertedDealId: deal.id,
      },
    });

    return { contactId: contact.id, dealId: deal.id };
  });

  await auditService.record({
    action: "lead.converted",
    actorId: actor.id,
    metadata: {
      contactId: result.contactId,
      dealId: result.dealId,
      source: existing.source,
    },
    requestId,
    resourceId: existing.id,
    resourceType: "lead",
  });

  await notificationService.create({
    title: "Лид конвертирован",
    body: `${existing.firstName} ${existing.lastName ?? ""} преобразован в контакт и сделку`,
    referenceType: "lead",
    referenceId: existing.id,
  });

  return NextResponse.json({
    data: {
      contactId: result.contactId,
      dealId: result.dealId,
    },
    requestId,
  });
});
