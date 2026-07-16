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

const updateWorkOrderSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  description: z.string().optional(),
  contactId: z.string().optional(),
  companyId: z.string().optional(),
  technicianId: z.string().optional(),
  scheduledAt: z.string().optional(),
  estimatedEndAt: z.string().optional(),
  siteAddress: z.string().optional(),
});

export const GET = withApiHandler(async ({ params, requestId }) => {
  const actor = await getCurrentActor();
  if (!actor) throw errors.unauthorized();
  if (!authorizationService.hasPermission(actor, PERMISSIONS.DELIVERY_ORDERS_READ)) {
    throw errors.forbidden();
  }

  const orderId = params?.id;
  if (!orderId) throw errors.forbidden("Invalid order ID.");

  const order = await prisma.workOrder.findUnique({
    where: { id: orderId },
    include: { contact: true, company: true, technician: true, logs: { orderBy: { createdAt: "desc" } } },
  });
  if (!order) throw errors.forbidden("Work order not found.");

  return NextResponse.json({
    data: {
      id: order.id,
      workOrderNumber: order.workOrderNumber,
      type: order.type,
      status: order.status,
      title: order.title,
      description: order.description,
      contactId: order.contactId,
      contactName: order.contact ? `${order.contact.firstName} ${order.contact.lastName ?? ""}`.trim() : null,
      companyId: order.companyId,
      companyName: order.company?.name ?? null,
      technicianId: order.technicianId,
      technicianName: order.technician?.displayName ?? null,
      scheduledAt: order.scheduledAt?.toISOString() ?? null,
      estimatedEndAt: order.estimatedEndAt?.toISOString() ?? null,
      completedAt: order.completedAt?.toISOString() ?? null,
      siteAddress: order.siteAddress,
      notes: order.notes,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      logs: order.logs.map((l) => ({
        id: l.id,
        status: l.status,
        note: l.note,
        actorId: l.actorId,
        createdAt: l.createdAt.toISOString(),
      })),
    },
    requestId,
  });
});

export const PATCH = withApiHandler(async ({ params, request, requestId }) => {
  const actor = await getCurrentActor();
  if (!actor) throw errors.unauthorized();
  if (!authorizationService.hasPermission(actor, PERMISSIONS.DELIVERY_ORDERS_MANAGE)) {
    throw errors.forbidden();
  }

  const orderId = params?.id;
  if (!orderId) throw errors.forbidden("Invalid order ID.");

  const body = await request.json();
  const parsed = updateWorkOrderSchema.safeParse(body);
  if (!parsed.success) throw errors.forbidden("Invalid request body.");

  const d = parsed.data;

  const existing = await prisma.workOrder.findUnique({ where: { id: orderId } });
  if (!existing) throw errors.forbidden("Work order not found.");

  const order = await prisma.workOrder.update({
    where: { id: orderId },
    data: {
      ...(d.title !== undefined && { title: d.title }),
      ...(d.description !== undefined && { description: d.description || null }),
      ...(d.contactId !== undefined && { contactId: d.contactId || null }),
      ...(d.companyId !== undefined && { companyId: d.companyId || null }),
      ...(d.technicianId !== undefined && { technicianId: d.technicianId || null }),
      ...(d.scheduledAt !== undefined && { scheduledAt: d.scheduledAt ? new Date(d.scheduledAt) : null }),
      ...(d.estimatedEndAt !== undefined && { estimatedEndAt: d.estimatedEndAt ? new Date(d.estimatedEndAt) : null }),
      ...(d.siteAddress !== undefined && { siteAddress: d.siteAddress || null }),
    },
  });

  await auditService.record({
    action: "work_order.updated",
    actorId: actor.id,
    metadata: { title: order.title },
    requestId,
    resourceId: order.id,
    resourceType: "work_order",
  });

  return NextResponse.json({ success: true, requestId });
});

export const DELETE = withApiHandler(async ({ params, requestId }) => {
  const actor = await getCurrentActor();
  if (!actor) throw errors.unauthorized();
  if (!authorizationService.hasPermission(actor, PERMISSIONS.DELIVERY_ORDERS_MANAGE)) {
    throw errors.forbidden();
  }

  const orderId = params?.id;
  if (!orderId) throw errors.forbidden("Invalid order ID.");

  const existing = await prisma.workOrder.findUnique({ where: { id: orderId } });
  if (!existing) throw errors.forbidden("Work order not found.");
  if (existing.status !== "DRAFT") throw errors.forbidden("Only draft orders can be deleted.");

  await prisma.workOrderLog.deleteMany({ where: { workOrderId: orderId } });
  await prisma.workOrder.delete({ where: { id: orderId } });

  await auditService.record({
    action: "work_order.deleted",
    actorId: actor.id,
    metadata: { title: existing.title, number: existing.workOrderNumber },
    requestId,
    resourceId: orderId,
    resourceType: "work_order",
  });

  return NextResponse.json({ success: true, requestId });
});
