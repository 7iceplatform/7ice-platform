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

const updateFamilySchema = z.object({
  name: z.string().min(1).max(200).optional(),
  slug: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  categoryId: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
});

export const GET = withApiHandler(async ({ params, requestId }) => {
  const actor = await getCurrentActor();
  if (!actor) throw errors.unauthorized();
  if (!authorizationService.hasPermission(actor, PERMISSIONS.CATALOG_PRODUCTS_READ)) {
    throw errors.forbidden();
  }

  const familyId = params?.id;
  if (!familyId) {
    throw errors.forbidden("Invalid family ID.");
  }

  const family = await prisma.productFamily.findUnique({
    where: { id: familyId },
    include: {
      category: { select: { id: true, name: true } },
      products: {
        include: { _count: { select: { options: true } } },
        orderBy: { name: "asc" },
      },
    },
  });

  if (!family) {
    throw errors.forbidden("Product family not found.");
  }

  return NextResponse.json({
    data: {
      id: family.id,
      name: family.name,
      slug: family.slug,
      description: family.description,
      category: family.category,
      isActive: family.isActive,
      createdAt: family.createdAt.toISOString(),
      products: family.products.map((p) => ({
        id: p.id,
        model: p.model,
        name: p.name,
        priceAmount: p.priceAmount,
        priceCurrency: p.priceCurrency,
        optionsCount: p._count.options,
      })),
    },
    requestId,
  });
});

export const PATCH = withApiHandler(async ({ params, request, requestId }) => {
  const actor = await getCurrentActor();
  if (!actor) throw errors.unauthorized();
  if (!authorizationService.hasPermission(actor, PERMISSIONS.CATALOG_PRODUCTS_MANAGE)) {
    throw errors.forbidden();
  }

  const familyId = params?.id;
  if (!familyId) {
    throw errors.forbidden("Invalid family ID.");
  }

  const existing = await prisma.productFamily.findUnique({ where: { id: familyId } });
  if (!existing) {
    throw errors.forbidden("Product family not found.");
  }

  const body = await request.json();
  const parsed = updateFamilySchema.safeParse(body);

  if (!parsed.success) {
    throw errors.forbidden("Invalid request body.");
  }

  const updated = await prisma.productFamily.update({
    where: { id: familyId },
    data: parsed.data,
  });

  await auditService.record({
    action: "catalog.family.updated",
    actorId: actor.id,
    metadata: { slug: updated.slug, fields: Object.keys(parsed.data) },
    requestId,
    resourceId: familyId,
    resourceType: "catalog.family",
  });

  return NextResponse.json({ success: true, requestId });
});

export const DELETE = withApiHandler(async ({ params, requestId }) => {
  const actor = await getCurrentActor();
  if (!actor) throw errors.unauthorized();
  if (!authorizationService.hasPermission(actor, PERMISSIONS.CATALOG_PRODUCTS_MANAGE)) {
    throw errors.forbidden();
  }

  const familyId = params?.id;
  if (!familyId) {
    throw errors.forbidden("Invalid family ID.");
  }

  const existing = await prisma.productFamily.findUnique({
    where: { id: familyId },
    include: { _count: { select: { products: true } } },
  });

  if (!existing) {
    throw errors.forbidden("Product family not found.");
  }

  if (existing._count.products > 0) {
    throw errors.forbidden("Cannot delete product family with associated products.");
  }

  await prisma.productFamily.delete({ where: { id: familyId } });

  await auditService.record({
    action: "catalog.family.deleted",
    actorId: actor.id,
    metadata: { slug: existing.slug, name: existing.name },
    requestId,
    resourceId: familyId,
    resourceType: "catalog.family",
  });

  return NextResponse.json({ success: true, requestId });
});
