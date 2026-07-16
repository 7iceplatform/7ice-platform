import { NextResponse } from "next/server";
import { z } from "zod";

import type { InputJsonValue } from "@prisma/client/runtime/client";

import { getCurrentActor } from "@/auth/current-actor";
import { PERMISSIONS } from "@/config/permissions";
import { prisma } from "@/server/db/prisma";
import { authorizationService } from "@/server/services/authorization-service";
import { auditService } from "@/server/services/audit-service";
import { withApiHandler } from "@/lib/http/with-api-handler";
import { errors } from "@/lib/errors/app-error";

export const dynamic = "force-dynamic";

const updateIntegrationSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "ERROR", "PENDING"]).optional(),
  description: z.string().optional(),
  endpointUrl: z.string().url().optional(),
  configJson: z.record(z.string(), z.unknown()).optional(),
});

export const GET = withApiHandler(async ({ params, requestId }) => {
  const actor = await getCurrentActor();
  if (!actor) throw errors.unauthorized();
  if (!authorizationService.hasPermission(actor, PERMISSIONS.INTEGRATIONS_READ)) {
    throw errors.forbidden();
  }

  const integrationId = params?.id;
  if (!integrationId) throw errors.forbidden("Invalid integration ID.");

  const integration = await prisma.integration.findUnique({
    where: { id: integrationId },
    include: {
      logs: { orderBy: { createdAt: "desc" }, take: 20 },
      webhooks: true,
    },
  });
  if (!integration) throw errors.forbidden("Integration not found.");

  return NextResponse.json({
    data: {
      id: integration.id,
      name: integration.name,
      type: integration.type,
      status: integration.status,
      description: integration.description,
      endpointUrl: integration.endpointUrl,
      configJson: integration.configJson,
      lastSyncAt: integration.lastSyncAt?.toISOString() ?? null,
      lastErrorAt: integration.lastErrorAt?.toISOString() ?? null,
      lastError: integration.lastError,
      createdAt: integration.createdAt.toISOString(),
      updatedAt: integration.updatedAt.toISOString(),
      logs: integration.logs.map((l) => ({
        id: l.id,
        correlationId: l.correlationId,
        direction: l.direction,
        status: l.status,
        requestMethod: l.requestMethod,
        requestUrl: l.requestUrl,
        responseCode: l.responseCode,
        error: l.error,
        retryCount: l.retryCount,
        createdAt: l.createdAt.toISOString(),
      })),
      webhooks: integration.webhooks.map((w) => ({
        id: w.id,
        name: w.name,
        url: w.url,
        events: w.events,
        status: w.status,
        createdAt: w.createdAt.toISOString(),
      })),
    },
    requestId,
  });
});

export const PATCH = withApiHandler(async ({ params, request, requestId }) => {
  const actor = await getCurrentActor();
  if (!actor) throw errors.unauthorized();
  if (!authorizationService.hasPermission(actor, PERMISSIONS.INTEGRATIONS_MANAGE)) {
    throw errors.forbidden();
  }

  const integrationId = params?.id;
  if (!integrationId) throw errors.forbidden("Invalid integration ID.");

  const body = await request.json();
  const parsed = updateIntegrationSchema.safeParse(body);
  if (!parsed.success) throw errors.forbidden("Invalid request body.");

  const d = parsed.data;

  const existing = await prisma.integration.findUnique({ where: { id: integrationId } });
  if (!existing) throw errors.forbidden("Integration not found.");

  const integration = await prisma.integration.update({
    where: { id: integrationId },
    data: {
      ...(d.name !== undefined && { name: d.name }),
      ...(d.status !== undefined && { status: d.status }),
      ...(d.description !== undefined && { description: d.description || null }),
      ...(d.endpointUrl !== undefined && { endpointUrl: d.endpointUrl || null }),
      ...(d.configJson !== undefined && { configJson: d.configJson as InputJsonValue | undefined }),
    },
  });

  await auditService.record({
    action: "integration.updated",
    actorId: actor.id,
    metadata: { name: integration.name, status: integration.status },
    requestId,
    resourceId: integrationId,
    resourceType: "integration",
  });

  return NextResponse.json({ success: true, requestId });
});

export const DELETE = withApiHandler(async ({ params, requestId }) => {
  const actor = await getCurrentActor();
  if (!actor) throw errors.unauthorized();
  if (!authorizationService.hasPermission(actor, PERMISSIONS.INTEGRATIONS_MANAGE)) {
    throw errors.forbidden();
  }

  const integrationId = params?.id;
  if (!integrationId) throw errors.forbidden("Invalid integration ID.");

  const existing = await prisma.integration.findUnique({ where: { id: integrationId } });
  if (!existing) throw errors.forbidden("Integration not found.");

  await prisma.integrationLog.deleteMany({ where: { integrationId } });
  await prisma.webhook.deleteMany({ where: { integrationId } });
  await prisma.integration.delete({ where: { id: integrationId } });

  await auditService.record({
    action: "integration.deleted",
    actorId: actor.id,
    metadata: { name: existing.name },
    requestId,
    resourceId: integrationId,
    resourceType: "integration",
  });

  return NextResponse.json({ success: true, requestId });
});
