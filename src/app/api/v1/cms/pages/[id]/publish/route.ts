import { NextResponse } from "next/server";

import { getCurrentActor } from "@/auth/current-actor";
import { PERMISSIONS } from "@/config/permissions";
import { prisma } from "@/server/db/prisma";
import { authorizationService } from "@/server/services/authorization-service";
import { auditService } from "@/server/services/audit-service";
import { withApiHandler } from "@/lib/http/with-api-handler";
import { errors } from "@/lib/errors/app-error";

export const dynamic = "force-dynamic";

export const POST = withApiHandler(async ({ params, requestId }) => {
  const actor = await getCurrentActor();
  if (!actor) throw errors.unauthorized();
  if (!authorizationService.hasPermission(actor, PERMISSIONS.CMS_PAGES_PUBLISH)) {
    throw errors.forbidden();
  }

  const pageId = params?.id;
  if (!pageId) {
    throw errors.forbidden("Invalid page ID.");
  }

  const page = await prisma.page.findUnique({
    where: { id: pageId },
    include: {
      revisions: { orderBy: { version: "desc" }, take: 1 },
    },
  });

  if (!page) {
    throw errors.forbidden("Page not found.");
  }

  if (page.revisions.length === 0) {
    throw errors.forbidden("Page has no revisions to publish.");
  }

  const latestRevision = page.revisions[0];

  await prisma.page.update({
    where: { id: pageId },
    data: {
      status: "PUBLISHED",
      publishedAt: new Date(),
    },
  });

  await prisma.pageRevision.update({
    where: { id: latestRevision.id },
    data: { status: "PUBLISHED" },
  });

  await auditService.record({
    action: "page.published",
    actorId: actor.id,
    metadata: { slug: page.slug, version: latestRevision.version },
    requestId,
    resourceId: pageId,
    resourceType: "page",
  });

  return NextResponse.json({ success: true, requestId });
});
