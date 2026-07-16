import { prisma } from "@/server/db/prisma";
import type { AuthenticatedActor } from "@/types/auth";

export async function findActorByExternalSubject(
  externalSubject: string,
): Promise<AuthenticatedActor | null> {
  const user = await prisma.user.findUnique({
    where: { externalSubject },
    include: {
      roleAssignments: {
        include: {
          role: {
            include: {
              permissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!user || !user.isActive) {
    return null;
  }

  return {
    id: user.id,
    externalSubject: user.externalSubject,
    tenantId: user.tenantId,
    permissions: user.roleAssignments.flatMap((assignment) =>
      assignment.role.permissions.map((rolePermission) => rolePermission.permission.code),
    ),
    roles: user.roleAssignments.map((assignment) => assignment.role.code),
  };
}
