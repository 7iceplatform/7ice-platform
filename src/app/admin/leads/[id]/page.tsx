import { notFound } from "next/navigation";

import { prisma } from "@/server/db/prisma";
import { LeadDetail } from "@/components/admin/LeadsTable/LeadDetail";

export const dynamic = "force-dynamic";

export default async function LeadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const lead = await prisma.lead.findUnique({
    where: { id },
    include: { consents: true },
  });

  if (!lead) notFound();

  return (
    <LeadDetail
      lead={{
        ...lead,
        createdAt: lead.createdAt.toISOString(),
        consents: lead.consents.map((c) => ({
          ...c,
          capturedAt: c.capturedAt.toISOString(),
        })),
      }}
    />
  );
}
