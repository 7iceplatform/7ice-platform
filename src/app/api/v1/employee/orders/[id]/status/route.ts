import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentActor } from "@/auth/current-actor";
import { prisma } from "@/server/db/prisma";
import { auditService } from "@/server/services/audit-service";
import { notificationService } from "@/server/services/notification-service";
import { withApiHandler } from "@/lib/http/with-api-handler";
import { errors } from "@/lib/errors/app-error";

export const dynamic = "force-dynamic";

const VALID_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ["PLANNED", "CANCELLED"],
  PLANNED: ["SCHEDULED", "CANCELLED"],
  SCHEDULED: ["IN_PROGRESS", "ON_HOLD", "CANCELLED"],
  IN_PROGRESS: ["QUALITY_REVIEW", "ON_HOLD", "SCHEDULED"],
  ON_HOLD: ["SCHEDULED", "CANCELLED"],
  QUALITY_REVIEW: ["COMPLETED", "IN_PROGRESS"],
  COMPLETED: [],
  CANCELLED: [],
};

const transitionSchema = z.object({
  status: z.enum(["DRAFT", "PLANNED", "SCHEDULED", "IN_PROGRESS", "ON_HOLD", "QUALITY_REVIEW", "COMPLETED", "CANCELLED"]),
  note: z.string().optional(),
});

export const POST = withApiHandler(async ({ params, request, requestId }) => {
  const actor = await getCurrentActor();
  if (!actor) throw errors.unauthorized();

  const orderId = params?.id;
  if (!orderId) throw errors.forbidden("Invalid order ID.");

  const body = await request.json();
  const parsed = transitionSchema.safeParse(body);
  if (!parsed.success) throw errors.forbidden("Invalid status transition.");

  const existing = await prisma.workOrder.findUnique({ where: { id: orderId } });
  if (!existing) throw errors.forbidden("Work order not found.");

  if (existing.technicianId !== actor.id) {
    throw errors.forbidden("You can only update orders assigned to you.");
  }

  const allowed = VALID_TRANSITIONS[existing.status] ?? [];
  if (!allowed.includes(parsed.data.status)) {
    throw errors.forbidden(`Cannot transition from ${existing.status} to ${parsed.data.status}.`);
  }

  const updateData: Record<string, unknown> = { status: parsed.data.status };
  if (parsed.data.status === "COMPLETED") {
    updateData.completedAt = new Date();
  }

  const order = await prisma.workOrder.update({
    where: { id: orderId },
    data: updateData,
  });

  await prisma.workOrderLog.create({
    data: {
      workOrderId: orderId,
      status: parsed.data.status,
      actorId: actor.id,
      note: parsed.data.note || `Status changed to ${parsed.data.status}`,
    },
  });

  await auditService.record({
    action: "work_order.status_changed",
    actorId: actor.id,
    metadata: { from: existing.status, to: parsed.data.status, number: order.workOrderNumber },
    requestId,
    resourceId: orderId,
    resourceType: "work_order",
  });

  await notificationService.workOrderStatusChanged(
    { id: order.id, title: order.title, workOrderNumber: order.workOrderNumber },
    existing.status,
    parsed.data.status,
  );

  return NextResponse.json({ success: true, requestId });
});
