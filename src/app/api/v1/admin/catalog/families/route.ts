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

const createFamilySchema = z.object({
  name: z.string().min(1).max(200),
  slug: z.string().min(1).max(200),
  description: z.string().optional(),
  categoryId: z.string().min(1),
});

export const GET = withApiHandler(async ({ request, requestId }) => {
  const actor = await getCurrentActor();
  if (!actor) throw errors.unauthorized();
  if (!authorizationService.hasPermission(actor, PERMISSIONS.CATALOG_PRODUCTS_READ)) {
    throw errors.forbidden();
  }

  const url = new URL(request.url);
  const search = url.searchParams.get("search") ?? "";
  const categoryId = url.searchParams.get("categoryId") ?? "";

  const where: Record<string, unknown> = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { slug: { contains: search, mode: "insensitive" } },
    ];
  }
  if (categoryId) {
    where.categoryId = categoryId;
  }

  const families = await prisma.productFamily.findMany({
    where,
    include: {
      category: { select: { id: true, name: true } },
      _count: { select: { products: true } },
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({
    data: families.map((f) => ({
      id: f.id,
      name: f.name,
      slug: f.slug,
      description: f.description,
      category: f.category,
      productsCount: f._count.products,
      isActive: f.isActive,
      createdAt: f.createdAt.toISOString(),
    })),
    requestId,
  });
});

export const POST = withApiHandler(async ({ request, requestId }) => {
  const actor = await getCurrentActor();
  if (!actor) throw errors.unauthorized();
  if (!authorizationService.hasPermission(actor, PERMISSIONS.CATALOG_PRODUCTS_MANAGE)) {
    throw errors.forbidden();
  }

  const body = await request.json();
  const parsed = createFamilySchema.safeParse(body);

  if (!parsed.success) {
    throw errors.forbidden("Invalid request body.");
  }

  const category = await prisma.category.findUnique({
    where: { id: parsed.data.categoryId },
  });

  if (!category) {
    throw errors.forbidden("Category not found.");
  }

  const existing = await prisma.productFamily.findFirst({
    where: { slug: parsed.data.slug, tenantId: null },
  });

  if (existing) {
    throw errors.forbidden("A product family with this slug already exists.");
  }

  const family = await prisma.productFamily.create({
    data: {
      name: parsed.data.name,
      slug: parsed.data.slug,
      description: parsed.data.description,
      categoryId: parsed.data.categoryId,
    },
  });

  await auditService.record({
    action: "catalog.family.created",
    actorId: actor.id,
    metadata: { slug: family.slug, name: family.name, categoryId: category.id },
    requestId,
    resourceId: family.id,
    resourceType: "catalog.family",
  });

  return NextResponse.json({
    data: { id: family.id, slug: family.slug },
    requestId,
  });
});
