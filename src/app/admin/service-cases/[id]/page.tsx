import { notFound } from "next/navigation";

import { prisma } from "@/server/db/prisma";
import { ServiceCaseDetail } from "@/components/admin/ServiceCasesTable/ServiceCaseDetail";

export const dynamic = "force-dynamic";

export default async function ServiceCasePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const serviceCase = await prisma.serviceCase.findUnique({
    where: { id },
    include: {
      contact: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
      company: { select: { id: true, name: true } },
      workOrder: { select: { id: true, workOrderNumber: true, status: true, type: true } },
      logs: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!serviceCase) notFound();

  return (
    <ServiceCaseDetail
      serviceCase={{
        ...serviceCase,
        resolvedAt: serviceCase.resolvedAt?.toISOString() ?? null,
        closedAt: serviceCase.closedAt?.toISOString() ?? null,
        createdAt: serviceCase.createdAt.toISOString(),
        logs: serviceCase.logs.map((l) => ({
          ...l,
          createdAt: l.createdAt.toISOString(),
        })),
      }}
    />
  );
}
