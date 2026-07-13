import { getServerSession } from "next-auth";

import { authOptions } from "@/auth/auth-options";
import { prisma } from "@/server/db/prisma";
import type { AuthenticatedActor } from "@/types/auth";

export async function getCurrentActor(): Promise<AuthenticatedActor | null> {
  const session = await getServerSession(authOptions);
  const externalSubject = session?.user?.id;

  if (!externalSubject) {
    return null;
  }

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
    permissions: user.roleAssignments.flatMap((assignment) =>
      assignment.role.permissions.map((rolePermission) => rolePermission.permission.code),
    ),
    roles: user.roleAssignments.map((assignment) => assignment.role.code),
  };
}
