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

const updateCategorySchema = z.object({
  name: z.string().min(1).max(200).optional(),
  slug: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  parentId: z.string().nullable().optional(),
  order: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

export const GET = withApiHandler(async ({ params, requestId }) => {
  const actor = await getCurrentActor();
  if (!actor) throw errors.unauthorized();
  if (!authorizationService.hasPermission(actor, PERMISSIONS.CATALOG_CATEGORIES_READ)) {
    throw errors.forbidden();
  }

  const categoryId = params?.id;
  if (!categoryId) {
    throw errors.forbidden("Invalid category ID.");
  }

  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    include: {
      families: {
        include: { _count: { select: { products: true } } },
        orderBy: { name: "asc" },
      },
      children: {
        orderBy: { order: "asc" },
      },
    },
  });

  if (!category) {
    throw errors.forbidden("Category not found.");
  }

  return NextResponse.json({
    data: {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      parentId: category.parentId,
      order: category.order,
      isActive: category.isActive,
      createdAt: category.createdAt.toISOString(),
      families: category.families.map((f) => ({
        id: f.id,
        name: f.name,
        slug: f.slug,
        productsCount: f._count.products,
      })),
      children: category.children.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        order: c.order,
      })),
    },
    requestId,
  });
});

export const PATCH = withApiHandler(async ({ params, request, requestId }) => {
  const actor = await getCurrentActor();
  if (!actor) throw errors.unauthorized();
  if (!authorizationService.hasPermission(actor, PERMISSIONS.CATALOG_CATEGORIES_MANAGE)) {
    throw errors.forbidden();
  }

  const categoryId = params?.id;
  if (!categoryId) {
    throw errors.forbidden("Invalid category ID.");
  }

  const existing = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!existing) {
    throw errors.forbidden("Category not found.");
  }

  const body = await request.json();
  const parsed = updateCategorySchema.safeParse(body);

  if (!parsed.success) {
    throw errors.forbidden("Invalid request body.");
  }

  const updated = await prisma.category.update({
    where: { id: categoryId },
    data: parsed.data,
  });

  await auditService.record({
    action: "catalog.category.updated",
    actorId: actor.id,
    metadata: { slug: updated.slug, fields: Object.keys(parsed.data) },
    requestId,
    resourceId: categoryId,
    resourceType: "catalog.category",
  });

  return NextResponse.json({ success: true, requestId });
});

export const DELETE = withApiHandler(async ({ params, requestId }) => {
  const actor = await getCurrentActor();
  if (!actor) throw errors.unauthorized();
  if (!authorizationService.hasPermission(actor, PERMISSIONS.CATALOG_CATEGORIES_MANAGE)) {
    throw errors.forbidden();
  }

  const categoryId = params?.id;
  if (!categoryId) {
    throw errors.forbidden("Invalid category ID.");
  }

  const existing = await prisma.category.findUnique({
    where: { id: categoryId },
    include: { _count: { select: { families: true, children: true } } },
  });

  if (!existing) {
    throw errors.forbidden("Category not found.");
  }

  if (existing._count.families > 0) {
    throw errors.forbidden("Cannot delete category with associated product families.");
  }

  if (existing._count.children > 0) {
    throw errors.forbidden("Cannot delete category with subcategories.");
  }

  await prisma.category.delete({ where: { id: categoryId } });

  await auditService.record({
    action: "catalog.category.deleted",
    actorId: actor.id,
    metadata: { slug: existing.slug, name: existing.name },
    requestId,
    resourceId: categoryId,
    resourceType: "catalog.category",
  });

  return NextResponse.json({ success: true, requestId });
});
