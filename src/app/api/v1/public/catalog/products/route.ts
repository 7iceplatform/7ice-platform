import { NextResponse } from "next/server";

import { prisma } from "@/server/db/prisma";
import { withApiHandler } from "@/lib/http/with-api-handler";

export const dynamic = "force-dynamic";

export const GET = withApiHandler(async ({ request, requestId }) => {
  const url = new URL(request.url);
  const search = url.searchParams.get("search") ?? "";
  const familyId = url.searchParams.get("familyId") ?? "";
  const page = Math.max(1, Number(url.searchParams.get("page") ?? "1"));
  const pageSize = Math.min(50, Math.max(1, Number(url.searchParams.get("pageSize") ?? "20")));

  const where: Record<string, unknown> = { isActive: true };
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
      family: p.productFamily,
    })),
    pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    requestId,
  });
});
