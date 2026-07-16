import { NextResponse } from "next/server";

import { prisma } from "@/server/db/prisma";
import { withApiHandler } from "@/lib/http/with-api-handler";
import { errors } from "@/lib/errors/app-error";

export const dynamic = "force-dynamic";

export const GET = withApiHandler(async ({ params, requestId }) => {
  const productId = params?.id;
  if (!productId) throw errors.forbidden("Invalid product ID.");

  const product = await prisma.product.findFirst({
    where: { id: productId, isActive: true },
    include: {
      productFamily: { select: { id: true, name: true, slug: true, category: { select: { id: true, name: true, slug: true } } } },
      options: true,
    },
  });

  if (!product) throw errors.forbidden("Product not found.");

  return NextResponse.json({
    data: {
      id: product.id,
      model: product.model,
      name: product.name,
      description: product.description,
      specs: product.specs,
      priceAmount: product.priceAmount,
      priceCurrency: product.priceCurrency,
      family: product.productFamily,
      options: product.options.map((opt) => ({
        id: opt.id,
        name: opt.name,
        type: opt.type,
        values: opt.values,
        priceModifier: opt.priceModifier,
      })),
    },
    requestId,
  });
});
