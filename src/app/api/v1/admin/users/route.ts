import { NextResponse } from "next/server";

import { getCurrentActor } from "@/auth/current-actor";
import { PERMISSIONS } from "@/config/permissions";
import { prisma } from "@/server/db/prisma";
import { authorizationService } from "@/server/services/authorization-service";
import { withApiHandler } from "@/lib/http/with-api-handler";
import { errors } from "@/lib/errors/app-error";

export const dynamic = "force-dynamic";

export const GET = withApiHandler(async ({ request, requestId }) => {
  const actor = await getCurrentActor();
  if (!actor) throw errors.unauthorized();
  if (!authorizationService.hasPermission(actor, PERMISSIONS.ADMIN_USERS_READ)) {
    throw errors.forbidden();
  }

  const url = new URL(request.url);
  const search = url.searchParams.get("search") ?? "";
  const page = Math.max(1, Number(url.searchParams.get("page") ?? "1"));
  const pageSize = Math.min(50, Math.max(1, Number(url.searchParams.get("pageSize") ?? "20")));

  const where = search
    ? {
        OR: [
          { email: { contains: search, mode: "insensitive" as const } },
          { displayName: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      include: {
        roleAssignments: {
          include: {
            role: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.user.count({ where }),
  ]);

  return NextResponse.json({
    data: users.map((user) => ({
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      isActive: user.isActive,
      createdAt: user.createdAt.toISOString(),
      roles: user.roleAssignments.map((a) => ({
        id: a.role.id,
        code: a.role.code,
        name: a.role.name,
      })),
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
