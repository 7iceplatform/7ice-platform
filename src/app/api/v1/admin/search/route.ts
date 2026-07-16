import { NextResponse } from "next/server";

import { getCurrentActor } from "@/auth/current-actor";
import { PERMISSIONS } from "@/config/permissions";
import { prisma } from "@/server/db/prisma";
import { authorizationService } from "@/server/services/authorization-service";
import { withApiHandler } from "@/lib/http/with-api-handler";
import { errors } from "@/lib/errors/app-error";
import { tenantWhere } from "@/lib/tenant-scope";

export const dynamic = "force-dynamic";

export const GET = withApiHandler(async ({ request, requestId }) => {
  const actor = await getCurrentActor();
  if (!actor) throw errors.unauthorized();
  if (!authorizationService.hasPermission(actor, PERMISSIONS.ADMIN_ACCESS)) throw errors.forbidden();

  const url = new URL(request.url);
  const q = url.searchParams.get("q") ?? "";
  if (q.length < 2) {
    return NextResponse.json({ data: {}, requestId });
  }

  const searchFilter = { contains: q, mode: "insensitive" as const };
  const baseWhere = tenantWhere(actor);

  const [contacts, companies, deals, workOrders, serviceCases, invoices, leads] = await Promise.all([
    prisma.contact.findMany({
      where: { ...baseWhere, OR: [{ firstName: searchFilter }, { lastName: searchFilter }, { email: searchFilter }] },
      take: 5,
      select: { id: true, firstName: true, lastName: true, email: true },
    }),
    prisma.company.findMany({
      where: { ...baseWhere, name: searchFilter },
      take: 5,
      select: { id: true, name: true },
    }),
    prisma.deal.findMany({
      where: { ...baseWhere, title: searchFilter },
      take: 5,
      select: { id: true, title: true, stage: true },
    }),
    prisma.workOrder.findMany({
      where: { ...baseWhere, title: searchFilter },
      take: 5,
      select: { id: true, title: true, workOrderNumber: true, status: true },
    }),
    prisma.serviceCase.findMany({
      where: { ...baseWhere, OR: [{ title: searchFilter }, { description: searchFilter }] },
      take: 5,
      select: { id: true, title: true, caseNumber: true, status: true },
    }),
    prisma.invoice.findMany({
      where: { ...baseWhere, OR: [{ invoiceNumber: { equals: Number(q) || -1 } }, { description: searchFilter }] },
      take: 5,
      select: { id: true, invoiceNumber: true, status: true },
    }),
    prisma.lead.findMany({
      where: { ...baseWhere, OR: [{ firstName: searchFilter }, { lastName: searchFilter }, { email: searchFilter }] },
      take: 5,
      select: { id: true, firstName: true, lastName: true, email: true, status: true },
    }),
  ]);

  return NextResponse.json({
    data: { contacts, companies, deals, workOrders, serviceCases, invoices, leads },
    requestId,
  });
});
