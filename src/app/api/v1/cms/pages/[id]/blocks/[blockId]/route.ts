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

const updateBlockSchema = z.object({
  type: z.enum(["HEADING", "TEXT", "IMAGE", "LIST", "QUOTE", "HTML", "SPACER"]).optional(),
  content: z.record(z.string(), z.unknown()).optional(),
  order: z.number().int().min(0).optional(),
});

export const PATCH = withApiHandler(async ({ params, request, requestId }) => {
  const actor = await getCurrentActor();
  if (!actor) throw errors.unauthorized();
  if (!authorizationService.hasPermission(actor, PERMISSIONS.CMS_PAGES_MANAGE)) {
    throw errors.forbidden();
  }

  const blockId = params?.blockId;
  if (!blockId) throw errors.forbidden("Invalid block ID.");

  const existing = await prisma.pageBlock.findUnique({ where: { id: blockId } });
  if (!existing) throw errors.forbidden("Block not found.");

  const body = await request.json();
  const parsed = updateBlockSchema.safeParse(body);
  if (!parsed.success) throw errors.forbidden("Invalid request body.");

  const data: Record<string, unknown> = {};
  if (parsed.data.type) data.type = parsed.data.type;
  if (parsed.data.content) data.content = parsed.data.content as InputJsonValue;
  if (parsed.data.order !== undefined) data.order = parsed.data.order;

  await prisma.pageBlock.update({ where: { id: blockId }, data });

  await auditService.record({
    action: "page.block.updated",
    actorId: actor.id,
    metadata: { blockId, fields: Object.keys(parsed.data) },
    requestId,
    resourceId: blockId,
    resourceType: "page_block",
  });

  return NextResponse.json({ success: true, requestId });
});

export const DELETE = withApiHandler(async ({ params, requestId }) => {
  const actor = await getCurrentActor();
  if (!actor) throw errors.unauthorized();
  if (!authorizationService.hasPermission(actor, PERMISSIONS.CMS_PAGES_MANAGE)) {
    throw errors.forbidden();
  }

  const blockId = params?.blockId;
  if (!blockId) throw errors.forbidden("Invalid block ID.");

  const existing = await prisma.pageBlock.findUnique({ where: { id: blockId } });
  if (!existing) throw errors.forbidden("Block not found.");

  await prisma.pageBlock.delete({ where: { id: blockId } });

  await auditService.record({
    action: "page.block.deleted",
    actorId: actor.id,
    metadata: { blockId, type: existing.type },
    requestId,
    resourceId: blockId,
    resourceType: "page_block",
  });

  return NextResponse.json({ success: true, requestId });
});
