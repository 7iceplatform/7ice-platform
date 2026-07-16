import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentActor } from "@/auth/current-actor";
import { PERMISSIONS } from "@/config/permissions";
import { prisma } from "@/server/db/prisma";
import { authorizationService } from "@/server/services/authorization-service";
import { auditService } from "@/server/services/audit-service";
import { notificationService } from "@/server/services/notification-service";
import { withApiHandler } from "@/lib/http/with-api-handler";
import { errors } from "@/lib/errors/app-error";
import { tenantWhere, tenantCreate } from "@/lib/tenant-scope";

export const dynamic = "force-dynamic";

const createWorkOrderSchema = z.object({
  type: z.enum(["INSTALLATION", "SERVICE", "MAINTENANCE", "REMEDIATION"]),
  title: z.string().min(1).max(500),
  description: z.string().optional(),
  contactId: z.string().optional(),
  companyId: z.string().optional(),
  scheduledAt: z.string().optional(),
  estimatedEndAt: z.string().optional(),
  technicianId: z.string().optional(),
  siteAddress: z.string().optional(),
});

export const GET = withApiHandler(async ({ request, requestId }) => {
  const actor = await getCurrentActor();
  if (!actor) throw errors.unauthorized();
  if (!authorizationService.hasPermission(actor, PERMISSIONS.DELIVERY_ORDERS_READ)) {
    throw errors.forbidden();
  }

  const url = new URL(request.url);
  const status = url.searchParams.get("status") ?? "";
  const type = url.searchParams.get("type") ?? "";
  const page = Math.max(1, Number(url.searchParams.get("page") ?? "1"));
  const pageSize = Math.min(50, Math.max(1, Number(url.searchParams.get("pageSize") ?? "20")));

  const where: Record<string, unknown> = tenantWhere(actor);
  if (status) where.status = status;
  if (type) where.type = type;

  const [orders, total] = await Promise.all([
    prisma.workOrder.findMany({
      where,
      include: { contact: true, company: true, technician: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.workOrder.count({ where }),
  ]);

  return NextResponse.json({
    data: orders.map((o) => ({
      id: o.id,
      workOrderNumber: o.workOrderNumber,
      type: o.type,
      status: o.status,
      title: o.title,
      description: o.description,
      contactId: o.contactId,
      contactName: o.contact ? `${o.contact.firstName} ${o.contact.lastName ?? ""}`.trim() : null,
      companyId: o.companyId,
      companyName: o.company?.name ?? null,
      technicianId: o.technicianId,
      technicianName: o.technician?.displayName ?? null,
      scheduledAt: o.scheduledAt?.toISOString() ?? null,
      estimatedEndAt: o.estimatedEndAt?.toISOString() ?? null,
      completedAt: o.completedAt?.toISOString() ?? null,
      siteAddress: o.siteAddress,
      createdAt: o.createdAt.toISOString(),
    })),
    pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    requestId,
  });
});

export const POST = withApiHandler(async ({ request, requestId }) => {
  const actor = await getCurrentActor();
  if (!actor) throw errors.unauthorized();
  if (!authorizationService.hasPermission(actor, PERMISSIONS.DELIVERY_ORDERS_MANAGE)) {
    throw errors.forbidden();
  }

  const body = await request.json();
  const parsed = createWorkOrderSchema.safeParse(body);
  if (!parsed.success) throw errors.forbidden("Invalid request body.");

  const d = parsed.data;

  const maxNumber = await prisma.workOrder.aggregate({ _max: { workOrderNumber: true } });
  const nextNumber = (maxNumber._max.workOrderNumber ?? 0) + 1;

  const order = await prisma.workOrder.create({
    data: tenantCreate(actor, {
      workOrderNumber: nextNumber,
      type: d.type,
      title: d.title,
      description: d.description || null,
      contactId: d.contactId || null,
      companyId: d.companyId || null,
      scheduledAt: d.scheduledAt ? new Date(d.scheduledAt) : null,
      estimatedEndAt: d.estimatedEndAt ? new Date(d.estimatedEndAt) : null,
      technicianId: d.technicianId || null,
      siteAddress: d.siteAddress || null,
    }),
  });

  await prisma.workOrderLog.create({
    data: {
      workOrderId: order.id,
      status: "DRAFT",
      actorId: actor.id,
      note: "Work order created",
    },
  });

  await auditService.record({
    action: "work_order.created",
    actorId: actor.id,
    metadata: { title: order.title, type: order.type, number: nextNumber },
    requestId,
    resourceId: order.id,
    resourceType: "work_order",
  });

  await notificationService.workOrderCreated({
    id: order.id,
    title: order.title,
    workOrderNumber: nextNumber,
    type: order.type,
  });

  return NextResponse.json({ data: { id: order.id, workOrderNumber: nextNumber }, requestId });
});
