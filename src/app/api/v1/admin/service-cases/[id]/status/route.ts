import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentActor } from "@/auth/current-actor";
import { PERMISSIONS } from "@/config/permissions";
import { prisma } from "@/server/db/prisma";
import { authorizationService } from "@/server/services/authorization-service";
import { auditService } from "@/server/services/audit-service";
import { withApiHandler } from "@/lib/http/with-api-handler";
import { errors } from "@/lib/errors/app-error";

export const dynamic = "force-dynamic";

const VALID_TRANSITIONS: Record<string, string[]> = {
  NEW: ["TRIAGED"],
  TRIAGED: ["AWAITING_CUSTOMER", "PLANNED"],
  AWAITING_CUSTOMER: ["TRIAGED", "PLANNED"],
  PLANNED: ["IN_PROGRESS"],
  IN_PROGRESS: ["RESOLVED"],
  RESOLVED: ["CONFIRMED"],
  CONFIRMED: ["CLOSED"],
  CLOSED: [],
};

const statusSchema = z.object({
  status: z.string().min(1),
  note: z.string().optional(),
});

export const POST = withApiHandler(async ({ request, params, requestId }) => {
  const actor = await getCurrentActor();
  if (!actor) throw errors.unauthorized();
  if (!authorizationService.hasPermission(actor, PERMISSIONS.SERVICE_CASES_MANAGE)) {
    throw errors.forbidden();
  }

  const body = await request.json();
  const parsed = statusSchema.safeParse(body);
  if (!parsed.success) throw errors.forbidden("Invalid request body.");

  const existing = await prisma.serviceCase.findUnique({ where: { id: params?.id } });
  if (!existing) throw errors.notFound("Service case not found.");

  const allowed = VALID_TRANSITIONS[existing.status] ?? [];
  if (!allowed.includes(parsed.data.status)) {
    throw errors.conflict(
      `Cannot transition from ${existing.status} to ${parsed.data.status}. Allowed: ${allowed.join(", ") || "none"}`,
    );
  }

  const updateData: Record<string, unknown> = { status: parsed.data.status };
  if (parsed.data.status === "RESOLVED") updateData.resolvedAt = new Date();
  if (parsed.data.status === "CLOSED") updateData.closedAt = new Date();

  await prisma.serviceCase.update({ where: { id: params?.id }, data: updateData });

  await prisma.serviceCaseLog.create({
    data: {
      serviceCaseId: params?.id ?? "",
      status: parsed.data.status as never,
      note: parsed.data.note,
      actorId: actor.id,
    },
  });

  await auditService.record({
    action: "service_case.status_changed",
    actorId: actor.id,
    metadata: { from: existing.status, to: parsed.data.status },
    requestId,
    resourceId: existing.id,
    resourceType: "service_case",
  });

  return NextResponse.json({
    data: { caseNumber: existing.caseNumber, from: existing.status, to: parsed.data.status },
    requestId,
  });
});
