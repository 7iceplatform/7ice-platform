import { NextResponse } from "next/server";

import { getCurrentActor } from "@/auth/current-actor";
import { prisma } from "@/server/db/prisma";
import { withApiHandler } from "@/lib/http/with-api-handler";
import { errors } from "@/lib/errors/app-error";

export const dynamic = "force-dynamic";

export const GET = withApiHandler(async ({ requestId }) => {
  const actor = await getCurrentActor();
  if (!actor) throw errors.unauthorized();

  const [assignedOrders, pendingOrders, myCompletedOrders, totalContacts, totalDeals] = await Promise.all([
    prisma.workOrder.count({
      where: { technicianId: actor.id, status: { in: ["SCHEDULED", "IN_PROGRESS"] } },
    }),
    prisma.workOrder.count({
      where: { technicianId: actor.id, status: "PLANNED" },
    }),
    prisma.workOrder.count({
      where: { technicianId: actor.id, status: "COMPLETED" },
    }),
    prisma.contact.count(),
    prisma.deal.count({ where: { stage: { in: ["NEW", "QUALIFIED", "PROPOSAL", "NEGOTIATION"] } } }),
  ]);

  const todayOrders = await prisma.workOrder.findMany({
    where: {
      technicianId: actor.id,
      status: { in: ["SCHEDULED", "IN_PROGRESS"] },
      scheduledAt: { not: null },
    },
    include: { contact: true, company: true },
    orderBy: { scheduledAt: "asc" },
    take: 10,
  });

  const recentOrders = await prisma.workOrder.findMany({
    where: { technicianId: actor.id },
    orderBy: { createdAt: "desc" },
    take: 10,
    include: { contact: true, company: true },
  });

  return NextResponse.json({
    data: {
      stats: {
        assignedOrders,
        pendingOrders,
        myCompletedOrders,
        totalContacts,
        totalDeals,
      },
      todayOrders: todayOrders.map((o) => ({
        id: o.id,
        number: o.workOrderNumber,
        type: o.type,
        status: o.status,
        title: o.title,
        contactName: o.contact ? `${o.contact.firstName} ${o.contact.lastName ?? ""}`.trim() : null,
        companyName: o.company?.name ?? null,
        scheduledAt: o.scheduledAt?.toISOString() ?? null,
        siteAddress: o.siteAddress,
      })),
      recentOrders: recentOrders.map((o) => ({
        id: o.id,
        number: o.workOrderNumber,
        type: o.type,
        status: o.status,
        title: o.title,
        contactName: o.contact ? `${o.contact.firstName} ${o.contact.lastName ?? ""}`.trim() : null,
        companyName: o.company?.name ?? null,
        scheduledAt: o.scheduledAt?.toISOString() ?? null,
        createdAt: o.createdAt.toISOString(),
      })),
    },
    requestId,
  });
});
