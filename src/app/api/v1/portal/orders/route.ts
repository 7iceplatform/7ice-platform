import { NextResponse } from "next/server";

import { getCurrentActor } from "@/auth/current-actor";
import { prisma } from "@/server/db/prisma";
import { withApiHandler } from "@/lib/http/with-api-handler";
import { errors } from "@/lib/errors/app-error";

export const dynamic = "force-dynamic";

export const GET = withApiHandler(async ({ request, requestId }) => {
  const actor = await getCurrentActor();
  if (!actor) throw errors.unauthorized();

  const user = await prisma.user.findUnique({ where: { id: actor.id } });
  if (!user) throw errors.unauthorized();

  const url = new URL(request.url);
  const status = url.searchParams.get("status") ?? "";
  const page = Math.max(1, Number(url.searchParams.get("page") ?? "1"));
  const pageSize = Math.min(50, Math.max(1, Number(url.searchParams.get("pageSize") ?? "20")));

  const where: Record<string, unknown> = {
    contactId: { not: null },
    contact: { email: user.email },
  };
  if (status) where.status = status;

  const [orders, total] = await Promise.all([
    prisma.workOrder.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { contact: true },
    }),
    prisma.workOrder.count({ where }),
  ]);

  return NextResponse.json({
    data: orders.map((o) => ({
      id: o.id,
      number: o.workOrderNumber,
      type: o.type,
      status: o.status,
      title: o.title,
      contactName: o.contact ? `${o.contact.firstName} ${o.contact.lastName ?? ""}`.trim() : null,
      scheduledAt: o.scheduledAt?.toISOString() ?? null,
      siteAddress: o.siteAddress,
      createdAt: o.createdAt.toISOString(),
    })),
    pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    requestId,
  });
});
