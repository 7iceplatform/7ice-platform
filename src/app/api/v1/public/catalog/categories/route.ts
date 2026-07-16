import { NextResponse } from "next/server";

import { prisma } from "@/server/db/prisma";
import { withApiHandler } from "@/lib/http/with-api-handler";

export const dynamic = "force-dynamic";

export const GET = withApiHandler(async ({ requestId }) => {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    include: {
      _count: { select: { families: true } },
    },
    orderBy: [{ order: "asc" }, { name: "asc" }],
  });

  return NextResponse.json({
    data: categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      familiesCount: cat._count.families,
    })),
    requestId,
  });
});
