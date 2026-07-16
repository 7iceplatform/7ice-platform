import { NextResponse } from "next/server";
import { z } from "zod";
import { createHmac } from "crypto";

import type { InputJsonValue } from "@prisma/client/runtime/client";

import { getCurrentActor } from "@/auth/current-actor";
import { PERMISSIONS } from "@/config/permissions";
import { prisma } from "@/server/db/prisma";
import { authorizationService } from "@/server/services/authorization-service";
import { auditService } from "@/server/services/audit-service";
import { withApiHandler } from "@/lib/http/with-api-handler";
import { errors } from "@/lib/errors/app-error";

export const dynamic = "force-dynamic";

const testSchema = z.object({
  event: z.enum([
    "CONTACT_CREATED",
    "CONTACT_UPDATED",
    "DEAL_CREATED",
    "DEAL_STAGE_CHANGED",
    "INVOICE_ISSUED",
    "INVOICE_PAID",
    "WORK_ORDER_CREATED",
    "WORK_ORDER_COMPLETED",
    "PAYMENT_RECEIVED",
  ]),
});

const SAMPLE_PAYLOADS: Record<string, Record<string, unknown>> = {
  CONTACT_CREATED: { contact: { id: "test_123", firstName: "Иван", email: "test@example.com" } },
  CONTACT_UPDATED: { contact: { id: "test_123", firstName: "Иван", email: "test@example.com" }, changes: ["email"] },
  DEAL_CREATED: { deal: { id: "test_123", title: "Тестовая сделка", stage: "NEW" } },
  DEAL_STAGE_CHANGED: { deal: { id: "test_123", title: "Тестовая сделка" }, from: "NEW", to: "QUALIFIED" },
  INVOICE_ISSUED: { invoice: { id: "test_123", invoiceNumber: 1001, totalCents: 50000 } },
  INVOICE_PAID: { invoice: { id: "test_123", invoiceNumber: 1001 } },
  WORK_ORDER_CREATED: { workOrder: { id: "test_123", workOrderNumber: 2001, title: "Монтаж" } },
  WORK_ORDER_COMPLETED: { workOrder: { id: "test_123", workOrderNumber: 2001, title: "Монтаж" } },
  PAYMENT_RECEIVED: { payment: { id: "test_123", amountCents: 50000, invoiceNumber: 1001 } },
};

export const POST = withApiHandler(async ({ params, request, requestId }) => {
  const actor = await getCurrentActor();
  if (!actor) throw errors.unauthorized();
  if (!authorizationService.hasPermission(actor, PERMISSIONS.WEBHOOKS_MANAGE)) {
    throw errors.forbidden();
  }

  const webhookId = params?.id;
  if (!webhookId) throw errors.forbidden("Invalid webhook ID.");

  const webhook = await prisma.webhook.findUnique({ where: { id: webhookId } });
  if (!webhook) throw errors.forbidden("Webhook not found.");

  const body = await request.json();
  const parsed = testSchema.safeParse(body);
  if (!parsed.success) throw errors.forbidden("Invalid request body.");

  const event = parsed.data.event;
  const payload = SAMPLE_PAYLOADS[event] ?? { event };

  let status = "SUCCESS";
  let responseCode = 200;
  let error: string | null = null;

  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "X-Webhook-Event": event,
      "X-Webhook-Id": webhookId,
    };

    if (webhook.secret) {
      const signature = createHmac("sha256", webhook.secret)
        .update(JSON.stringify(payload))
        .digest("hex");
      headers["X-Webhook-Signature"] = `sha256=${signature}`;
    }

    const response = await fetch(webhook.url, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10000),
    });

    responseCode = response.status;
    if (!response.ok) {
      status = "FAILED";
      error = `HTTP ${responseCode}`;
    }
  } catch (e) {
    status = "FAILED";
    error = e instanceof Error ? e.message : "Network error";
    responseCode = 0;
  }

  const delivery = await prisma.webhookDelivery.create({
    data: {
      webhookId,
      event,
      payload: payload as InputJsonValue,
      responseCode,
      status,
      error,
    },
  });

  await auditService.record({
    action: "webhook.tested",
    actorId: actor.id,
    metadata: { webhookId, event, status, responseCode },
    requestId,
    resourceId: delivery.id,
    resourceType: "webhook_delivery",
  });

  return NextResponse.json({
    data: {
      deliveryId: delivery.id,
      status,
      responseCode,
      error,
    },
    requestId,
  });
});
