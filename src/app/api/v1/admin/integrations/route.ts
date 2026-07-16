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

const createIntegrationSchema = z.object({
  name: z.string().min(1).max(200),
  type: z.enum(["API_KEY", "WEBHOOK", "OAUTH2", "SYNC"]),
  description: z.string().optional(),
  endpointUrl: z.string().url().optional(),
  configJson: z.record(z.string(), z.unknown()).optional(),
});

export const GET = withApiHandler(async ({ requestId }) => {
  const actor = await getCurrentActor();
  if (!actor) throw errors.unauthorized();
  if (!authorizationService.hasPermission(actor, PERMISSIONS.INTEGRATIONS_READ)) {
    throw errors.forbidden();
  }

  const integrations = await prisma.integration.findMany({
    include: { _count: { select: { logs: true, webhooks: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    data: integrations.map((i) => ({
      id: i.id,
      name: i.name,
      type: i.type,
      status: i.status,
      description: i.description,
      endpointUrl: i.endpointUrl,
      lastSyncAt: i.lastSyncAt?.toISOString() ?? null,
      lastErrorAt: i.lastErrorAt?.toISOString() ?? null,
      lastError: i.lastError,
      logCount: i._count.logs,
      webhookCount: i._count.webhooks,
      createdAt: i.createdAt.toISOString(),
    })),
    requestId,
  });
});

export const POST = withApiHandler(async ({ request, requestId }) => {
  const actor = await getCurrentActor();
  if (!actor) throw errors.unauthorized();
  if (!authorizationService.hasPermission(actor, PERMISSIONS.INTEGRATIONS_MANAGE)) {
    throw errors.forbidden();
  }

  const body = await request.json();
  const parsed = createIntegrationSchema.safeParse(body);
  if (!parsed.success) throw errors.forbidden("Invalid request body.");

  const d = parsed.data;

  const integration = await prisma.integration.create({
    data: {
      name: d.name,
      type: d.type,
      description: d.description || null,
      endpointUrl: d.endpointUrl || null,
      configJson: d.configJson as InputJsonValue | undefined,
    },
  });

  await auditService.record({
    action: "integration.created",
    actorId: actor.id,
    metadata: { name: integration.name, type: integration.type },
    requestId,
    resourceId: integration.id,
    resourceType: "integration",
  });

  return NextResponse.json({ data: { id: integration.id }, requestId });
});
