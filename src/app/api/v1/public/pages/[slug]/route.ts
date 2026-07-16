import { NextResponse } from "next/server";

import { prisma } from "@/server/db/prisma";
import { withApiHandler } from "@/lib/http/with-api-handler";
import { errors } from "@/lib/errors/app-error";

export const dynamic = "force-dynamic";

export const GET = withApiHandler(async ({ request, requestId }) => {
  const url = new URL(request.url);
  const pathParts = url.pathname.split("/");
  const slug = pathParts.at(-1);

  if (!slug) {
    throw errors.forbidden("Invalid slug.");
  }

  const page = await prisma.page.findFirst({
    where: {
      slug,
      status: "PUBLISHED",
    },
    include: {
      revisions: {
        where: { status: "PUBLISHED" },
        orderBy: { version: "desc" },
        take: 1,
        include: {
          blocks: { orderBy: { order: "asc" } },
        },
      },
    },
  });

  if (!page) {
    throw errors.forbidden("Page not found.");
  }

  const revision = page.revisions[0];

  return NextResponse.json({
    data: {
      slug: page.slug,
      title: page.title,
      description: page.description,
      metaTitle: page.metaTitle,
      metaDesc: page.metaDesc,
      publishedAt: page.publishedAt?.toISOString() ?? null,
      blocks: revision?.blocks.map((block) => ({
        type: block.type,
        order: block.order,
        content: block.content,
      })) ?? [],
    },
    requestId,
  });
});
