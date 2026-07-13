import { NextResponse } from "next/server";

import { getCurrentActor } from "@/auth/current-actor";
import { errors } from "@/lib/errors/app-error";
import { withApiHandler } from "@/lib/http/with-api-handler";

export const dynamic = "force-dynamic";

export const GET = withApiHandler(async ({ requestId }) => {
  const actor = await getCurrentActor();

  if (!actor) {
    throw errors.unauthorized();
  }

  return NextResponse.json({
    externalSubject: actor.externalSubject,
    id: actor.id,
    permissions: actor.permissions,
    requestId,
    roles: actor.roles,
  });
});
