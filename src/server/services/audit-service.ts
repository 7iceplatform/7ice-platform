import { prisma } from "@/server/db/prisma";
import type { Prisma } from "@/generated/prisma/client";

interface RecordAuditEventInput {
  action: string;
  actorId?: string;
  metadata?: Prisma.InputJsonObject;
  requestId?: string;
  resourceId?: string;
  resourceType: string;
}

export class AuditService {
  async record(input: RecordAuditEventInput): Promise<void> {
    await prisma.auditRecord.create({
      data: {
        action: input.action,
        actorId: input.actorId,
        metadata: input.metadata,
        requestId: input.requestId,
        resourceId: input.resourceId,
        resourceType: input.resourceType,
      },
    });
  }
}

export const auditService = new AuditService();
