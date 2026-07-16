import { NextResponse } from "next/server";

import { prisma } from "@/server/db/prisma";
import { withApiHandler } from "@/lib/http/with-api-handler";

export const dynamic = "force-dynamic";

export const GET = withApiHandler(async ({ request, requestId }) => {
  const url = new URL(request.url);
  const categoryId = url.searchParams.get("categoryId") ?? "";

  const where: Record<string, unknown> = { isActive: true };
  if (categoryId) {
    where.categoryId = categoryId;
  }

  const families = await prisma.productFamily.findMany({
    where,
    include: {
      category: { select: { id: true, name: true, slug: true } },
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
    })),
    requestId,
  });
});
