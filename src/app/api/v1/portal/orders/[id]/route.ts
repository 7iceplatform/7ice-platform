import { NextResponse } from "next/server";

import { getCurrentActor } from "@/auth/current-actor";
import { prisma } from "@/server/db/prisma";
import { withApiHandler } from "@/lib/http/with-api-handler";
import { errors } from "@/lib/errors/app-error";

export const dynamic = "force-dynamic";

export const GET = withApiHandler(async ({ params, requestId }) => {
  const actor = await getCurrentActor();
  if (!actor) throw errors.unauthorized();

  const user = await prisma.user.findUnique({ where: { id: actor.id } });
  if (!user) throw errors.unauthorized();

  const orderId = params?.id;
  if (!orderId) throw errors.forbidden("Invalid order ID.");

  const order = await prisma.workOrder.findUnique({
    where: { id: orderId },
    include: {
      contact: true,
      company: true,
      logs: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!order) throw errors.forbidden("Order not found.");
  if (order.contact?.email !== user.email) throw errors.forbidden("Access denied.");

  return NextResponse.json({
    data: {
      id: order.id,
      number: order.workOrderNumber,
      type: order.type,
      status: order.status,
      title: order.title,
      description: order.description,
      contactName: order.contact ? `${order.contact.firstName} ${order.contact.lastName ?? ""}`.trim() : null,
      companyName: order.company?.name ?? null,
      siteAddress: order.siteAddress,
      scheduledAt: order.scheduledAt?.toISOString() ?? null,
      completedAt: order.completedAt?.toISOString() ?? null,
      createdAt: order.createdAt.toISOString(),
      logs: order.logs.map((l) => ({
        status: l.status,
        note: l.note,
        createdAt: l.createdAt.toISOString(),
      })),
    },
    requestId,
  });
});
