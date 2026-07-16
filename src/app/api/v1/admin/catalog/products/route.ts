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

const createProductSchema = z.object({
  productFamilyId: z.string().min(1),
  model: z.string().min(1).max(200),
  name: z.string().min(1).max(500),
  description: z.string().optional(),
  specs: z.record(z.string(), z.unknown()).optional(),
  priceAmount: z.number().int().min(0).optional(),
  priceCurrency: z.string().length(3).optional(),
});

export const GET = withApiHandler(async ({ request, requestId }) => {
  const actor = await getCurrentActor();
  if (!actor) throw errors.unauthorized();
  if (!authorizationService.hasPermission(actor, PERMISSIONS.CATALOG_PRODUCTS_READ)) {
    throw errors.forbidden();
  }

  const url = new URL(request.url);
  const search = url.searchParams.get("search") ?? "";
  const familyId = url.searchParams.get("familyId") ?? "";
  const page = Math.max(1, Number(url.searchParams.get("page") ?? "1"));
  const pageSize = Math.min(50, Math.max(1, Number(url.searchParams.get("pageSize") ?? "20")));

  const where: Record<string, unknown> = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { model: { contains: search, mode: "insensitive" } },
    ];
  }
  if (familyId) {
    where.productFamilyId = familyId;
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        productFamily: { select: { id: true, name: true, slug: true } },
        _count: { select: { options: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.product.count({ where }),
  ]);

  return NextResponse.json({
    data: products.map((p) => ({
      id: p.id,
      model: p.model,
      name: p.name,
      description: p.description,
      priceAmount: p.priceAmount,
      priceCurrency: p.priceCurrency,
      isActive: p.isActive,
      family: p.productFamily,
      optionsCount: p._count.options,
      createdAt: p.createdAt.toISOString(),
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
  if (!authorizationService.hasPermission(actor, PERMISSIONS.CATALOG_PRODUCTS_MANAGE)) {
    throw errors.forbidden();
  }

  const body = await request.json();
  const parsed = createProductSchema.safeParse(body);

  if (!parsed.success) {
    throw errors.forbidden("Invalid request body.");
  }

  const family = await prisma.productFamily.findUnique({
    where: { id: parsed.data.productFamilyId },
  });

  if (!family) {
    throw errors.forbidden("Product family not found.");
  }

  const product = await prisma.product.create({
    data: {
      productFamilyId: parsed.data.productFamilyId,
      model: parsed.data.model,
      name: parsed.data.name,
      description: parsed.data.description,
      specs: parsed.data.specs as InputJsonValue | undefined,
      priceAmount: parsed.data.priceAmount,
      priceCurrency: parsed.data.priceCurrency,
    },
  });

  await auditService.record({
    action: "catalog.product.created",
    actorId: actor.id,
    metadata: { model: product.model, name: product.name, familyId: family.id },
    requestId,
    resourceId: product.id,
    resourceType: "catalog.product",
  });

  return NextResponse.json({
    data: { id: product.id, model: product.model },
    requestId,
  });
});
