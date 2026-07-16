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

const createWebhookSchema = z.object({
  name: z.string().min(1).max(200),
  url: z.string().url(),
  secret: z.string().optional(),
  events: z.array(z.enum([
    "CONTACT_CREATED", "CONTACT_UPDATED",
    "DEAL_CREATED", "DEAL_STAGE_CHANGED",
    "INVOICE_ISSUED", "INVOICE_PAID",
    "WORK_ORDER_CREATED", "WORK_ORDER_COMPLETED",
    "PAYMENT_RECEIVED",
  ])).min(1),
  integrationId: z.string().optional(),
});

export const GET = withApiHandler(async ({ requestId }) => {
  const actor = await getCurrentActor();
  if (!actor) throw errors.unauthorized();
  if (!authorizationService.hasPermission(actor, PERMISSIONS.WEBHOOKS_READ)) {
    throw errors.forbidden();
  }

  const webhooks = await prisma.webhook.findMany({
    include: { integration: true, _count: { select: { deliveries: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    data: webhooks.map((w) => ({
      id: w.id,
      name: w.name,
      url: w.url,
      events: w.events,
      status: w.status,
      integrationName: w.integration?.name ?? null,
      deliveryCount: w._count.deliveries,
      createdAt: w.createdAt.toISOString(),
    })),
    requestId,
  });
});

export const POST = withApiHandler(async ({ request, requestId }) => {
  const actor = await getCurrentActor();
  if (!actor) throw errors.unauthorized();
  if (!authorizationService.hasPermission(actor, PERMISSIONS.WEBHOOKS_MANAGE)) {
    throw errors.forbidden();
  }

  const body = await request.json();
  const parsed = createWebhookSchema.safeParse(body);
  if (!parsed.success) throw errors.forbidden("Invalid request body.");

  const d = parsed.data;

  const webhook = await prisma.webhook.create({
    data: {
      name: d.name,
      url: d.url,
      secret: d.secret || null,
      events: d.events,
      integrationId: d.integrationId || null,
    },
  });

  await auditService.record({
    action: "webhook.created",
    actorId: actor.id,
    metadata: { name: webhook.name, url: webhook.url, events: webhook.events },
    requestId,
    resourceId: webhook.id,
    resourceType: "webhook",
  });

  return NextResponse.json({ data: { id: webhook.id }, requestId });
});
