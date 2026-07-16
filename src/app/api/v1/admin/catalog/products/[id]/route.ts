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

const updateProductSchema = z.object({
  model: z.string().min(1).max(200).optional(),
  name: z.string().min(1).max(500).optional(),
  description: z.string().optional(),
  specs: z.record(z.string(), z.unknown()).optional(),
  priceAmount: z.number().int().min(0).nullable().optional(),
  priceCurrency: z.string().length(3).optional(),
  isActive: z.boolean().optional(),
});

export const GET = withApiHandler(async ({ params, requestId }) => {
  const actor = await getCurrentActor();
  if (!actor) throw errors.unauthorized();
  if (!authorizationService.hasPermission(actor, PERMISSIONS.CATALOG_PRODUCTS_READ)) {
    throw errors.forbidden();
  }

  const productId = params?.id;
  if (!productId) {
    throw errors.forbidden("Invalid product ID.");
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      productFamily: { select: { id: true, name: true, slug: true, categoryId: true } },
      options: { orderBy: { name: "asc" } },
    },
  });

  if (!product) {
    throw errors.forbidden("Product not found.");
  }

  return NextResponse.json({
    data: {
      id: product.id,
      model: product.model,
      name: product.name,
      description: product.description,
      specs: product.specs,
      priceAmount: product.priceAmount,
      priceCurrency: product.priceCurrency,
      isActive: product.isActive,
      family: product.productFamily,
      options: product.options.map((opt) => ({
        id: opt.id,
        name: opt.name,
        type: opt.type,
        values: opt.values,
        priceModifier: opt.priceModifier,
      })),
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
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

  const productId = params?.id;
  if (!productId) {
    throw errors.forbidden("Invalid product ID.");
  }

  const existing = await prisma.product.findUnique({ where: { id: productId } });
  if (!existing) {
    throw errors.forbidden("Product not found.");
  }

  const body = await request.json();
  const parsed = updateProductSchema.safeParse(body);

  if (!parsed.success) {
    throw errors.forbidden("Invalid request body.");
  }

  const data: Record<string, unknown> = { ...parsed.data };
  if (data.specs) {
    data.specs = data.specs as InputJsonValue;
  }

  const updated = await prisma.product.update({
    where: { id: productId },
    data,
  });

  await auditService.record({
    action: "catalog.product.updated",
    actorId: actor.id,
    metadata: { model: updated.model, fields: Object.keys(parsed.data) },
    requestId,
    resourceId: productId,
    resourceType: "catalog.product",
  });

  return NextResponse.json({ success: true, requestId });
});

export const DELETE = withApiHandler(async ({ params, requestId }) => {
  const actor = await getCurrentActor();
  if (!actor) throw errors.unauthorized();
  if (!authorizationService.hasPermission(actor, PERMISSIONS.CATALOG_PRODUCTS_MANAGE)) {
    throw errors.forbidden();
  }

  const productId = params?.id;
  if (!productId) {
    throw errors.forbidden("Invalid product ID.");
  }

  const existing = await prisma.product.findUnique({ where: { id: productId } });
  if (!existing) {
    throw errors.forbidden("Product not found.");
  }

  await prisma.product.delete({ where: { id: productId } });

  await auditService.record({
    action: "catalog.product.deleted",
    actorId: actor.id,
    metadata: { model: existing.model, name: existing.name },
    requestId,
    resourceId: productId,
    resourceType: "catalog.product",
  });

  return NextResponse.json({ success: true, requestId });
});
