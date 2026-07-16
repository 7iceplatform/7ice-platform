import { NextResponse } from "next/server";

import { getCurrentActor } from "@/auth/current-actor";
import { PERMISSIONS } from "@/config/permissions";
import { prisma } from "@/server/db/prisma";
import { authorizationService } from "@/server/services/authorization-service";
import { withApiHandler } from "@/lib/http/with-api-handler";
import { errors } from "@/lib/errors/app-error";

export const dynamic = "force-dynamic";

export const GET = withApiHandler(async ({ requestId }) => {
  const actor = await getCurrentActor();
  if (!actor) throw errors.unauthorized();
  if (!authorizationService.hasPermission(actor, PERMISSIONS.ADMIN_ACCESS)) {
    throw errors.forbidden();
  }

  const [
    totalContacts,
    totalCompanies,
    totalDeals,
    dealsByStage,
    totalInvoices,
    invoicesByStatus,
    totalRevenue,
    paidRevenue,
    totalWorkOrders,
    workOrdersByStatus,
    recentContacts,
    recentDeals,
    recentInvoices,
  ] = await Promise.all([
    prisma.contact.count(),
    prisma.company.count(),
    prisma.deal.count(),
    prisma.deal.groupBy({ by: ["stage"], _count: true }),
    prisma.invoice.count(),
    prisma.invoice.groupBy({ by: ["status"], _count: true }),
    prisma.invoice.aggregate({ _sum: { amountCents: true, taxCents: true } }),
    prisma.invoice.aggregate({ _sum: { amountCents: true }, where: { status: "PAID" } }),
    prisma.workOrder.count(),
    prisma.workOrder.groupBy({ by: ["status"], _count: true }),
    prisma.contact.findMany({ orderBy: { createdAt: "desc" }, take: 5, select: { id: true, firstName: true, lastName: true, createdAt: true } }),
    prisma.deal.findMany({ orderBy: { createdAt: "desc" }, take: 5, select: { id: true, title: true, stage: true, createdAt: true } }),
    prisma.invoice.findMany({ orderBy: { createdAt: "desc" }, take: 5, select: { id: true, invoiceNumber: true, status: true, amountCents: true, taxCents: true, createdAt: true } }),
  ]);

  return NextResponse.json({
    data: {
      commercial: {
        contacts: totalContacts,
        companies: totalCompanies,
        deals: totalDeals,
        dealsByStage: dealsByStage.map((d) => ({ stage: d.stage, count: d._count })),
      },
      finance: {
        invoices: totalInvoices,
        invoicesByStatus: invoicesByStatus.map((i) => ({ status: i.status, count: i._count })),
        totalRevenueCents: (totalRevenue._sum.amountCents ?? 0) + (totalRevenue._sum.taxCents ?? 0),
        paidRevenueCents: paidRevenue._sum.amountCents ?? 0,
      },
      delivery: {
        workOrders: totalWorkOrders,
        workOrdersByStatus: workOrdersByStatus.map((w) => ({ status: w.status, count: w._count })),
      },
      recentActivity: {
        contacts: recentContacts.map((c) => ({
          id: c.id,
          label: `${c.firstName} ${c.lastName ?? ""}`.trim(),
          createdAt: c.createdAt.toISOString(),
        })),
        deals: recentDeals.map((d) => ({
          id: d.id,
          label: d.title,
          stage: d.stage,
          createdAt: d.createdAt.toISOString(),
        })),
        invoices: recentInvoices.map((i) => ({
          id: i.id,
          number: i.invoiceNumber,
          status: i.status,
          amountCents: i.amountCents + i.taxCents,
          createdAt: i.createdAt.toISOString(),
        })),
      },
    },
    requestId,
  });
});
