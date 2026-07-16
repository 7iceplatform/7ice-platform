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

const updatePageSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  description: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDesc: z.string().optional(),
  content: z.record(z.string(), z.unknown()).optional(),
});

export const GET = withApiHandler(async ({ params, requestId }) => {
  const actor = await getCurrentActor();
  if (!actor) throw errors.unauthorized();
  if (!authorizationService.hasPermission(actor, PERMISSIONS.CMS_PAGES_READ)) {
    throw errors.forbidden();
  }

  const pageId = params?.id;
  if (!pageId) {
    throw errors.forbidden("Invalid page ID.");
  }

  const page = await prisma.page.findUnique({
    where: { id: pageId },
    include: {
      revisions: {
        orderBy: { version: "desc" },
        include: {
          blocks: { orderBy: { order: "asc" } },
        },
      },
    },
  });

  if (!page) {
    throw errors.forbidden("Page not found.");
  }

  return NextResponse.json({
    data: {
      id: page.id,
      slug: page.slug,
      title: page.title,
      description: page.description,
      metaTitle: page.metaTitle,
      metaDesc: page.metaDesc,
      status: page.status,
      publishedAt: page.publishedAt?.toISOString() ?? null,
      createdAt: page.createdAt.toISOString(),
      updatedAt: page.updatedAt.toISOString(),
      revisions: page.revisions.map((rev) => ({
        id: rev.id,
        version: rev.version,
        content: rev.content,
        status: rev.status,
        createdAt: rev.createdAt.toISOString(),
        blocks: rev.blocks.map((block) => ({
          id: block.id,
          type: block.type,
          order: block.order,
          content: block.content,
        })),
      })),
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
  if (!pageId) {
    throw errors.forbidden("Invalid page ID.");
  }

  const existing = await prisma.page.findUnique({ where: { id: pageId } });
  if (!existing) {
    throw errors.forbidden("Page not found.");
  }

  const body = await request.json();
  const parsed = updatePageSchema.safeParse(body);

  if (!parsed.success) {
    throw errors.forbidden("Invalid request body.");
  }

  const { content, ...pageFields } = parsed.data;

  const updated = await prisma.page.update({
    where: { id: pageId },
    data: pageFields,
  });

  if (content) {
    const latestRevision = await prisma.pageRevision.findFirst({
      where: { pageId },
      orderBy: { version: "desc" },
    });

    const newVersion = (latestRevision?.version ?? 0) + 1;

    await prisma.pageRevision.create({
      data: {
        pageId,
        version: newVersion,
        content: content as InputJsonValue,
        authorId: actor.id,
        status: "DRAFT",
      },
    });
  }

  await auditService.record({
    action: "page.updated",
    actorId: actor.id,
    metadata: { slug: updated.slug, fields: Object.keys(pageFields) },
    requestId,
    resourceId: pageId,
    resourceType: "page",
  });

  return NextResponse.json({ success: true, requestId });
});

export const DELETE = withApiHandler(async ({ params, requestId }) => {
  const actor = await getCurrentActor();
  if (!actor) throw errors.unauthorized();
  if (!authorizationService.hasPermission(actor, PERMISSIONS.CMS_PAGES_MANAGE)) {
    throw errors.forbidden();
  }

  const pageId = params?.id;
  if (!pageId) throw errors.forbidden("Invalid page ID.");

  const existing = await prisma.page.findUnique({ where: { id: pageId } });
  if (!existing) throw errors.forbidden("Page not found.");

  await prisma.pageRevision.deleteMany({ where: { pageId } });
  await prisma.page.delete({ where: { id: pageId } });

  await auditService.record({
    action: "page.deleted",
    actorId: actor.id,
    metadata: { slug: existing.slug, title: existing.title },
    requestId,
    resourceId: pageId,
    resourceType: "page",
  });

  return NextResponse.json({ success: true, requestId });
});
