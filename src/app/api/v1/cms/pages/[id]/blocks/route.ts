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

const blockTypes = ["HEADING", "TEXT", "IMAGE", "LIST", "QUOTE", "HTML", "SPACER"] as const;

const createBlockSchema = z.object({
  type: z.enum(blockTypes),
  content: z.record(z.string(), z.unknown()),
  order: z.number().int().min(0).optional(),
});

const reorderBlocksSchema = z.object({
  blockIds: z.array(z.string()),
});

async function getLatestDraftRevision(pageId: string) {
  let revision = await prisma.pageRevision.findFirst({
    where: { pageId, status: "DRAFT" },
    orderBy: { version: "desc" },
  });

  if (!revision) {
    const latest = await prisma.pageRevision.findFirst({
      where: { pageId },
      orderBy: { version: "desc" },
    });
    const newVersion = (latest?.version ?? 0) + 1;
    revision = await prisma.pageRevision.create({
      data: {
        pageId,
        version: newVersion,
        content: {},
        status: "DRAFT",
      },
    });
  }

  return revision;
}

export const GET = withApiHandler(async ({ params, requestId }) => {
  const actor = await getCurrentActor();
  if (!actor) throw errors.unauthorized();
  if (!authorizationService.hasPermission(actor, PERMISSIONS.CMS_PAGES_READ)) {
    throw errors.forbidden();
  }

  const pageId = params?.id;
  if (!pageId) throw errors.forbidden("Invalid page ID.");

  const revision = await prisma.pageRevision.findFirst({
    where: { pageId, status: "DRAFT" },
    orderBy: { version: "desc" },
    include: { blocks: { orderBy: { order: "asc" } } },
  });

  if (!revision) {
    return NextResponse.json({ data: [], requestId });
  }

  return NextResponse.json({
    data: revision.blocks.map((b) => ({
      id: b.id,
      type: b.type,
      order: b.order,
      content: b.content,
      createdAt: b.createdAt.toISOString(),
    })),
    revisionId: revision.id,
    requestId,
  });
});

export const POST = withApiHandler(async ({ params, request, requestId }) => {
  const actor = await getCurrentActor();
  if (!actor) throw errors.unauthorized();
  if (!authorizationService.hasPermission(actor, PERMISSIONS.CMS_PAGES_MANAGE)) {
    throw errors.forbidden();
  }

  const pageId = params?.id;
  if (!pageId) throw errors.forbidden("Invalid page ID.");

  const body = await request.json();
  const parsed = createBlockSchema.safeParse(body);
  if (!parsed.success) throw errors.forbidden("Invalid request body.");

  const revision = await getLatestDraftRevision(pageId);

  const maxOrder = await prisma.pageBlock.aggregate({
    where: { revisionId: revision.id },
    _max: { order: true },
  });

  const order = parsed.data.order ?? ((maxOrder._max.order ?? -1) + 1);

  const block = await prisma.pageBlock.create({
    data: {
      revisionId: revision.id,
      type: parsed.data.type,
      order,
      content: parsed.data.content as InputJsonValue,
    },
  });

  await auditService.record({
    action: "page.block.created",
    actorId: actor.id,
    metadata: { pageId, revisionId: revision.id, type: parsed.data.type },
    requestId,
    resourceId: block.id,
    resourceType: "page_block",
  });

  return NextResponse.json({
    data: {
      id: block.id,
      type: block.type,
      order: block.order,
      content: block.content,
    },
    requestId,
  });
});

export const PATCH = withApiHandler(async ({ params, request, requestId }) => {
  const actor = await getCurrentActor();
  if (!actor) throw errors.unauthorized();
  if (!authorizationService.hasPermission(actor, PERMISSIONS.CMS_PAGES_MANAGE)) {
    throw errors.forbidden();
  }

  const pageId = params?.id;
  if (!pageId) throw errors.forbidden("Invalid page ID.");

  const body = await request.json();
  const parsed = reorderBlocksSchema.safeParse(body);
  if (!parsed.success) throw errors.forbidden("Invalid request body.");

  const revision = await prisma.pageRevision.findFirst({
    where: { pageId, status: "DRAFT" },
    orderBy: { version: "desc" },
  });

  if (!revision) throw errors.forbidden("No draft revision.");

  const updates = parsed.data.blockIds.map((blockId, index) =>
    prisma.pageBlock.update({
      where: { id: blockId },
      data: { order: index },
    })
  );

  await Promise.all(updates);

  return NextResponse.json({ success: true, requestId });
});
