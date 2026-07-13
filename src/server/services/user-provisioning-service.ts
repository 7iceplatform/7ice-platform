import { ROLES } from "@/config/permissions";
import { prisma } from "@/server/db/prisma";
import { auditService } from "@/server/services/audit-service";

interface ProvisionUserInput {
  displayName?: string | null;
  email?: string | null;
  externalSubject: string;
}

export class UserProvisioningService {
  async provisionFromIdentity(input: ProvisionUserInput): Promise<void> {
    const user = await prisma.user.upsert({
      where: { externalSubject: input.externalSubject },
      create: {
        displayName: input.displayName ?? undefined,
        email: input.email ?? undefined,
        externalSubject: input.externalSubject,
      },
      update: {
        displayName: input.displayName ?? undefined,
        email: input.email ?? undefined,
      },
    });

    await this.maybeAssignBootstrapAdministrator(user.id, user.email);
  }

  private async maybeAssignBootstrapAdministrator(
    userId: string,
    email: string | null | undefined,
  ): Promise<void> {
    const bootstrapEmail = process.env.BOOTSTRAP_ADMIN_EMAIL?.trim().toLowerCase();

    if (!bootstrapEmail || !email || email.trim().toLowerCase() !== bootstrapEmail) {
      return;
    }

    const existingAdministrators = await prisma.roleAssignment.count({
      where: {
        role: {
          code: ROLES.ADMINISTRATOR,
        },
      },
    });

    if (existingAdministrators > 0) {
      return;
    }

    const administratorRole = await prisma.role.findUnique({
      where: { code: ROLES.ADMINISTRATOR },
    });

    if (!administratorRole) {
      return;
    }

    await prisma.roleAssignment.create({
      data: {
        assignedBy: "bootstrap",
        roleId: administratorRole.id,
        userId,
      },
    });

    await auditService.record({
      action: "role.assigned",
      actorId: userId,
      metadata: {
        assignedBy: "bootstrap",
        roleCode: ROLES.ADMINISTRATOR,
      },
      resourceId: userId,
      resourceType: "user",
    });
  }
}

export const userProvisioningService = new UserProvisioningService();
