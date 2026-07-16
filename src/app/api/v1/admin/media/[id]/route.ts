import { NextResponse } from "next/server";

import { getCurrentActor } from "@/auth/current-actor";
import { PERMISSIONS } from "@/config/permissions";
import { prisma } from "@/server/db/prisma";
import { authorizationService } from "@/server/services/authorization-service";
import { auditService } from "@/server/services/audit-service";
import { withApiHandler } from "@/lib/http/with-api-handler";
import { errors } from "@/lib/errors/app-error";

export const dynamic = "force-dynamic";

export const PATCH = withApiHandler(async ({ request, params, requestId }) => {
  const actor = await getCurrentActor();
  if (!actor) throw errors.unauthorized();
  if (!authorizationService.hasPermission(actor, PERMISSIONS.CMS_MEDIA_MANAGE)) {
    throw errors.forbidden();
  }

  const mediaId = params?.id;
  if (!mediaId) throw errors.forbidden("Invalid media ID.");

  const existing = await prisma.media.findUnique({ where: { id: mediaId } });
  if (!existing) throw errors.notFound("Media not found.");

  const body = await request.json();
  const updated = await prisma.media.update({
    where: { id: mediaId },
    data: {
      ...(body.alt !== undefined && { alt: body.alt || null }),
      ...(body.rights !== undefined && { rights: body.rights || null }),
      ...(body.license !== undefined && { license: body.license || null }),
      ...(body.isLegalHold !== undefined && { isLegalHold: body.isLegalHold }),
      ...(body.retentionUntil !== undefined && {
        retentionUntil: body.retentionUntil ? new Date(body.retentionUntil) : null,
      }),
    },
  });

  await auditService.record({
    action: "media.updated",
    actorId: actor.id,
    metadata: { changes: Object.keys(body) },
    requestId,
    resourceId: mediaId,
    resourceType: "media",
  });

  return NextResponse.json({ data: { id: updated.id }, requestId });
});

export const DELETE = withApiHandler(async ({ params, requestId }) => {
  const actor = await getCurrentActor();
  if (!actor) throw errors.unauthorized();
  if (!authorizationService.hasPermission(actor, PERMISSIONS.CMS_MEDIA_MANAGE)) {
    throw errors.forbidden();
  }

  const mediaId = params?.id;
  if (!mediaId) throw errors.forbidden("Invalid media ID.");

  const existing = await prisma.media.findUnique({ where: { id: mediaId } });
  if (!existing) throw errors.notFound("Media not found.");

  if (existing.isLegalHold) {
    throw errors.conflict("Cannot delete media under legal hold.");
  }

  if (existing.retentionUntil && existing.retentionUntil > new Date()) {
    throw errors.conflict("Cannot delete media before retention period expires.");
  }

  const isReferenced = await checkMediaReferences(mediaId);
  if (isReferenced) {
    throw errors.conflict("Cannot delete media that is referenced by pages or products.");
  }

  await prisma.media.update({
    where: { id: mediaId },
    data: { deletedAt: new Date() },
  });

  await auditService.record({
    action: "media.soft_deleted",
    actorId: actor.id,
    metadata: { filename: existing.filename },
    requestId,
    resourceId: mediaId,
    resourceType: "media",
  });

  return NextResponse.json({ success: true, requestId });
});

async function checkMediaReferences(mediaId: string): Promise<boolean> {
  const url = `/uploads/${mediaId}`;

  const pageWithMedia = await prisma.pageRevision.findFirst({
    where: { content: { path: ["blocks"], array_contains: url } },
    take: 1,
  });

  if (pageWithMedia) return true;

  return false;
}
