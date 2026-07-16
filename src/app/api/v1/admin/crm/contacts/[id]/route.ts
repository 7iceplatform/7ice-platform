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

const updateContactSchema = z.object({
  firstName: z.string().min(1).max(200).optional(),
  lastName: z.string().max(200).nullable().optional(),
  email: z.string().email().nullable().optional(),
  phone: z.string().max(50).nullable().optional(),
  position: z.string().max(200).nullable().optional(),
  companyId: z.string().nullable().optional(),
});

export const GET = withApiHandler(async ({ params, requestId }) => {
  const actor = await getCurrentActor();
  if (!actor) throw errors.unauthorized();
  if (!authorizationService.hasPermission(actor, PERMISSIONS.CRM_CONTACTS_READ)) {
    throw errors.forbidden();
  }

  const contactId = params?.id;
  if (!contactId) throw errors.forbidden("Invalid contact ID.");

  const contact = await prisma.contact.findUnique({
    where: { id: contactId },
    include: {
      company: { select: { id: true, name: true } },
      deals: { orderBy: { createdAt: "desc" }, take: 10 },
      activities: { orderBy: { createdAt: "desc" }, take: 10 },
    },
  });

  if (!contact) throw errors.forbidden("Contact not found.");

  return NextResponse.json({
    data: {
      id: contact.id,
      firstName: contact.firstName,
      lastName: contact.lastName,
      email: contact.email,
      phone: contact.phone,
      position: contact.position,
      company: contact.company,
      deals: contact.deals.map((d) => ({
        id: d.id,
        title: d.title,
        stage: d.stage,
        valueAmount: d.valueAmount,
        valueCurrency: d.valueCurrency,
        createdAt: d.createdAt.toISOString(),
      })),
      activities: contact.activities.map((a) => ({
        id: a.id,
        type: a.type,
        subject: a.subject,
        body: a.body,
        dueAt: a.dueAt?.toISOString() ?? null,
        completedAt: a.completedAt?.toISOString() ?? null,
        createdAt: a.createdAt.toISOString(),
      })),
      createdAt: contact.createdAt.toISOString(),
    },
    requestId,
  });
});

export const PATCH = withApiHandler(async ({ params, request, requestId }) => {
  const actor = await getCurrentActor();
  if (!actor) throw errors.unauthorized();
  if (!authorizationService.hasPermission(actor, PERMISSIONS.CRM_CONTACTS_MANAGE)) {
    throw errors.forbidden();
  }

  const contactId = params?.id;
  if (!contactId) throw errors.forbidden("Invalid contact ID.");

  const existing = await prisma.contact.findUnique({ where: { id: contactId } });
  if (!existing) throw errors.forbidden("Contact not found.");

  const body = await request.json();
  const parsed = updateContactSchema.safeParse(body);

  if (!parsed.success) throw errors.forbidden("Invalid request body.");

  const updated = await prisma.contact.update({
    where: { id: contactId },
    data: parsed.data,
  });

  await auditService.record({
    action: "crm.contact.updated",
    actorId: actor.id,
    metadata: { firstName: updated.firstName, fields: Object.keys(parsed.data) },
    requestId,
    resourceId: contactId,
    resourceType: "crm.contact",
  });

  return NextResponse.json({ success: true, requestId });
});

export const DELETE = withApiHandler(async ({ params, requestId }) => {
  const actor = await getCurrentActor();
  if (!actor) throw errors.unauthorized();
  if (!authorizationService.hasPermission(actor, PERMISSIONS.CRM_CONTACTS_MANAGE)) {
    throw errors.forbidden();
  }

  const contactId = params?.id;
  if (!contactId) throw errors.forbidden("Invalid contact ID.");

  const existing = await prisma.contact.findUnique({
    where: { id: contactId },
    include: { _count: { select: { deals: true, activities: true } } },
  });
  if (!existing) throw errors.forbidden("Contact not found.");

  if (existing._count.deals > 0) {
    throw errors.forbidden("Cannot delete contact with associated deals.");
  }

  await prisma.contact.delete({ where: { id: contactId } });

  await auditService.record({
    action: "crm.contact.deleted",
    actorId: actor.id,
    metadata: { firstName: existing.firstName, lastName: existing.lastName },
    requestId,
    resourceId: contactId,
    resourceType: "crm.contact",
  });

  return NextResponse.json({ success: true, requestId });
});
