import { NextResponse } from "next/server";

import { getCurrentActor } from "@/auth/current-actor";
import { prisma } from "@/server/db/prisma";
import { withApiHandler } from "@/lib/http/with-api-handler";
import { errors } from "@/lib/errors/app-error";

export const dynamic = "force-dynamic";

export const GET = withApiHandler(async ({ requestId }) => {
  const actor = await getCurrentActor();
  if (!actor) throw errors.unauthorized();

  const user = await prisma.user.findUnique({
    where: { id: actor.id },
    include: { tenant: true },
  });

  const [totalOrders, activeOrders, completedOrders, totalInvoices, unpaidInvoices] = await Promise.all([
    prisma.workOrder.count({
      where: { contactId: { not: null }, contact: { email: user?.email ?? "" } },
    }),
    prisma.workOrder.count({
      where: {
        contactId: { not: null },
        contact: { email: user?.email ?? "" },
        status: { in: ["PLANNED", "SCHEDULED", "IN_PROGRESS", "ON_HOLD"] },
      },
    }),
    prisma.workOrder.count({
      where: {
        contactId: { not: null },
        contact: { email: user?.email ?? "" },
        status: "COMPLETED",
      },
    }),
    prisma.invoice.count({
      where: { contactId: { not: null }, contact: { email: user?.email ?? "" } },
    }),
    prisma.invoice.count({
      where: {
        contactId: { not: null },
        contact: { email: user?.email ?? "" },
        status: { in: ["ISSUED", "OVERDUE"] },
      },
    }),
  ]);

  const recentOrders = await prisma.workOrder.findMany({
    where: { contactId: { not: null }, contact: { email: user?.email ?? "" } },
    orderBy: { createdAt: "desc" },
    take: 5,
    select: {
      id: true,
      workOrderNumber: true,
      type: true,
      status: true,
      title: true,
      scheduledAt: true,
      createdAt: true,
    },
  });

  const recentInvoices = await prisma.invoice.findMany({
    where: { contactId: { not: null }, contact: { email: user?.email ?? "" } },
    orderBy: { createdAt: "desc" },
    take: 5,
    select: {
      id: true,
      invoiceNumber: true,
      status: true,
      amountCents: true,
      taxCents: true,
      dueAt: true,
      createdAt: true,
    },
  });

  return NextResponse.json({
    data: {
      stats: {
        totalOrders,
        activeOrders,
        completedOrders,
        totalInvoices,
        unpaidInvoices,
      },
      recentOrders: recentOrders.map((o) => ({
        id: o.id,
        number: o.workOrderNumber,
        type: o.type,
        status: o.status,
        title: o.title,
        scheduledAt: o.scheduledAt?.toISOString() ?? null,
        createdAt: o.createdAt.toISOString(),
      })),
      recentInvoices: recentInvoices.map((i) => ({
        id: i.id,
        number: i.invoiceNumber,
        status: i.status,
        totalCents: i.amountCents + i.taxCents,
        dueAt: i.dueAt?.toISOString() ?? null,
        createdAt: i.createdAt.toISOString(),
      })),
    },
    requestId,
  });
});
