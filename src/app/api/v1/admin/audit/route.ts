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
  if (!authorizationService.hasPermission(actor, PERMISSIONS.ADMIN_AUDIT_READ)) {
    throw errors.forbidden();
  }

  const url = new URL(request.url);
  const action = url.searchParams.get("action") ?? "";
  const resourceType = url.searchParams.get("resourceType") ?? "";
  const page = Math.max(1, Number(url.searchParams.get("page") ?? "1"));
  const pageSize = Math.min(50, Math.max(1, Number(url.searchParams.get("pageSize") ?? "20")));

  const where: Record<string, unknown> = tenantWhere(actor);

  if (action) {
    where.action = { contains: action, mode: "insensitive" };
  }

  if (resourceType) {
    where.resourceType = { contains: resourceType, mode: "insensitive" };
  }

  const [records, total] = await Promise.all([
    prisma.auditRecord.findMany({
      where,
      include: {
        actor: {
          select: {
            id: true,
            email: true,
            displayName: true,
          },
        },
      },
      orderBy: { occurredAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.auditRecord.count({ where }),
  ]);

  return NextResponse.json({
    data: records.map((record) => ({
      id: record.id,
      action: record.action,
      resourceType: record.resourceType,
      resourceId: record.resourceId,
      requestId: record.requestId,
      metadata: record.metadata,
      occurredAt: record.occurredAt.toISOString(),
      actor: record.actor,
    })),
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
    requestId,
  });
});
