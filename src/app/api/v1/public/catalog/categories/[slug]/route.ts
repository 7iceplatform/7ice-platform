import { NextResponse } from "next/server";

import { prisma } from "@/server/db/prisma";
import { withApiHandler } from "@/lib/http/with-api-handler";
import { errors } from "@/lib/errors/app-error";

export const dynamic = "force-dynamic";

export const GET = withApiHandler(async ({ params, requestId }) => {
  const slug = params?.slug;
  if (!slug) throw errors.forbidden("Invalid slug.");

  const category = await prisma.category.findFirst({
    where: { slug, isActive: true },
    include: {
      families: {
        where: { isActive: true },
        include: {
          _count: { select: { products: true } },
        },
        orderBy: { name: "asc" },
      },
    },
  });

  if (!category) throw errors.forbidden("Category not found.");

  return NextResponse.json({
    data: {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      families: category.families.map((f) => ({
        id: f.id,
        name: f.name,
        slug: f.slug,
        description: f.description,
        productsCount: f._count.products,
      })),
    },
    requestId,
  });
});
