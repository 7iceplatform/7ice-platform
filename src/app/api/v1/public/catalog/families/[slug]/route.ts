import { NextResponse } from "next/server";

import { prisma } from "@/server/db/prisma";
import { withApiHandler } from "@/lib/http/with-api-handler";
import { errors } from "@/lib/errors/app-error";

export const dynamic = "force-dynamic";

export const GET = withApiHandler(async ({ params, requestId }) => {
  const slug = params?.slug;
  if (!slug) throw errors.forbidden("Invalid slug.");

  const family = await prisma.productFamily.findFirst({
    where: { slug, isActive: true },
    include: {
      category: { select: { id: true, name: true, slug: true } },
      products: {
        where: { isActive: true },
        orderBy: { name: "asc" },
      },
    },
  });

  if (!family) throw errors.forbidden("Product family not found.");

  return NextResponse.json({
    data: {
      id: family.id,
      name: family.name,
      slug: family.slug,
      description: family.description,
      category: family.category,
      products: family.products.map((p) => ({
        id: p.id,
        model: p.model,
        name: p.name,
        description: p.description,
        priceAmount: p.priceAmount,
        priceCurrency: p.priceCurrency,
      })),
    },
    requestId,
  });
});
