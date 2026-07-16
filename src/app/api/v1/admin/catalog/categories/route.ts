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

const createCategorySchema = z.object({
  name: z.string().min(1).max(200),
  slug: z.string().min(1).max(200),
  description: z.string().optional(),
  parentId: z.string().optional(),
  order: z.number().int().min(0).optional(),
});

export const GET = withApiHandler(async ({ request, requestId }) => {
  const actor = await getCurrentActor();
  if (!actor) throw errors.unauthorized();
  if (!authorizationService.hasPermission(actor, PERMISSIONS.CATALOG_CATEGORIES_READ)) {
    throw errors.forbidden();
  }

  const url = new URL(request.url);
  const search = url.searchParams.get("search") ?? "";

  const where: Record<string, unknown> = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { slug: { contains: search, mode: "insensitive" } },
    ];
  }

  const categories = await prisma.category.findMany({
    where,
    include: {
      _count: { select: { families: true, children: true } },
    },
    orderBy: [{ order: "asc" }, { name: "asc" }],
  });

  return NextResponse.json({
    data: categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      parentId: cat.parentId,
      order: cat.order,
      isActive: cat.isActive,
      familiesCount: cat._count.families,
      childrenCount: cat._count.children,
      createdAt: cat.createdAt.toISOString(),
    })),
    requestId,
  });
});

export const POST = withApiHandler(async ({ request, requestId }) => {
  const actor = await getCurrentActor();
  if (!actor) throw errors.unauthorized();
  if (!authorizationService.hasPermission(actor, PERMISSIONS.CATALOG_CATEGORIES_MANAGE)) {
    throw errors.forbidden();
  }

  const body = await request.json();
  const parsed = createCategorySchema.safeParse(body);

  if (!parsed.success) {
    throw errors.forbidden("Invalid request body.");
  }

  const existing = await prisma.category.findFirst({
    where: { slug: parsed.data.slug, tenantId: null },
  });

  if (existing) {
    throw errors.forbidden("A category with this slug already exists.");
  }

  if (parsed.data.parentId) {
    const parent = await prisma.category.findUnique({ where: { id: parsed.data.parentId } });
    if (!parent) {
      throw errors.forbidden("Parent category not found.");
    }
  }

  const category = await prisma.category.create({
    data: {
      name: parsed.data.name,
      slug: parsed.data.slug,
      description: parsed.data.description,
      parentId: parsed.data.parentId,
      order: parsed.data.order ?? 0,
    },
  });

  await auditService.record({
    action: "catalog.category.created",
    actorId: actor.id,
    metadata: { slug: category.slug, name: category.name },
    requestId,
    resourceId: category.id,
    resourceType: "catalog.category",
  });

  return NextResponse.json({
    data: { id: category.id, slug: category.slug },
    requestId,
  });
});
