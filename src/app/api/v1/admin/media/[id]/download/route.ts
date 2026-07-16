import { NextResponse } from "next/server";
import { createHmac } from "crypto";

import { getCurrentActor } from "@/auth/current-actor";
import { PERMISSIONS } from "@/config/permissions";
import { prisma } from "@/server/db/prisma";
import { authorizationService } from "@/server/services/authorization-service";
import { auditService } from "@/server/services/audit-service";
import { withApiHandler } from "@/lib/http/with-api-handler";
import { errors } from "@/lib/errors/app-error";

export const dynamic = "force-dynamic";

const SIGNING_SECRET = process.env.MEDIA_SIGNING_SECRET ?? "media-signing-dev-secret";
const SIGNATURE_TTL_SECONDS = 3600;

export const GET = withApiHandler(async ({ params, requestId }) => {
  const actor = await getCurrentActor();
  if (!actor) throw errors.unauthorized();
  if (!authorizationService.hasPermission(actor, PERMISSIONS.CMS_MEDIA_READ)) {
    throw errors.forbidden();
  }

  const mediaId = params?.id;
  if (!mediaId) throw errors.forbidden("Invalid media ID.");

  const media = await prisma.media.findUnique({ where: { id: mediaId } });
  if (!media || media.deletedAt) {
    throw errors.notFound("Media not found.");
  }

  const expires = Math.floor(Date.now() / 1000) + SIGNATURE_TTL_SECONDS;
  const payload = `${mediaId}:${expires}`;
  const signature = createHmac("sha256", SIGNING_SECRET).update(payload).digest("hex");

  const signedUrl = `/uploads/${media.url.replace("/uploads/", "")}?expires=${expires}&signature=${signature}`;

  await auditService.record({
    action: "media.signed_url_generated",
    actorId: actor.id,
    metadata: { filename: media.filename },
    requestId,
    resourceId: mediaId,
    resourceType: "media",
  });

  return NextResponse.json({
    data: { signedUrl, expiresAt: new Date(expires * 1000).toISOString() },
    requestId,
  });
});
