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

const createPageSchema = z.object({
  slug: z.string().min(1).max(200),
  title: z.string().min(1).max(500),
  description: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDesc: z.string().optional(),
});

export const GET = withApiHandler(async ({ request, requestId }) => {
  const actor = await getCurrentActor();
  if (!actor) throw errors.unauthorized();
  if (!authorizationService.hasPermission(actor, PERMISSIONS.CMS_PAGES_READ)) {
    throw errors.forbidden();
  }

  const url = new URL(request.url);
  const search = url.searchParams.get("search") ?? "";
  const status = url.searchParams.get("status") ?? "";
  const page = Math.max(1, Number(url.searchParams.get("page") ?? "1"));
  const pageSize = Math.min(50, Math.max(1, Number(url.searchParams.get("pageSize") ?? "20")));

  const where: Record<string, unknown> = {};
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { slug: { contains: search, mode: "insensitive" } },
    ];
  }
  if (status) {
    where.status = status;
  }

  const [pages, total] = await Promise.all([
    prisma.page.findMany({
      where,
      include: {
        revisions: {
          orderBy: { version: "desc" },
          take: 1,
        },
      },
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.page.count({ where }),
  ]);

  return NextResponse.json({
    data: pages.map((pg) => ({
      id: pg.id,
      slug: pg.slug,
      title: pg.title,
      description: pg.description,
      status: pg.status,
      latestVersion: pg.revisions[0]?.version ?? 0,
      publishedAt: pg.publishedAt?.toISOString() ?? null,
      createdAt: pg.createdAt.toISOString(),
      updatedAt: pg.updatedAt.toISOString(),
    })),
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
    requestId,
  });
});

export const POST = withApiHandler(async ({ request, requestId }) => {
  const actor = await getCurrentActor();
  if (!actor) throw errors.unauthorized();
  if (!authorizationService.hasPermission(actor, PERMISSIONS.CMS_PAGES_MANAGE)) {
    throw errors.forbidden();
  }

  const body = await request.json();
  const parsed = createPageSchema.safeParse(body);

  if (!parsed.success) {
    throw errors.forbidden("Invalid request body.");
  }

  const existing = await prisma.page.findFirst({
    where: { slug: parsed.data.slug, tenantId: null },
  });

  if (existing) {
    throw errors.forbidden("A page with this slug already exists.");
  }

  const page = await prisma.page.create({
    data: {
      slug: parsed.data.slug,
      title: parsed.data.title,
      description: parsed.data.description,
      metaTitle: parsed.data.metaTitle,
      metaDesc: parsed.data.metaDesc,
    },
  });

  await prisma.pageRevision.create({
    data: {
      pageId: page.id,
      version: 1,
      content: {},
      authorId: actor.id,
      status: "DRAFT",
    },
  });

  await auditService.record({
    action: "page.created",
    actorId: actor.id,
    metadata: { slug: page.slug, title: page.title },
    requestId,
    resourceId: page.id,
    resourceType: "page",
  });

  return NextResponse.json({
    data: { id: page.id, slug: page.slug },
    requestId,
  });
});
