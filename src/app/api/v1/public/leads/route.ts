import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/server/db/prisma";
import { auditService } from "@/server/services/audit-service";
import { withApiHandler } from "@/lib/http/with-api-handler";
import { errors } from "@/lib/errors/app-error";

export const dynamic = "force-dynamic";

const leadSchema = z.object({
  firstName: z.string().min(1).max(200),
  lastName: z.string().max(200).optional(),
  email: z.string().email(),
  phone: z.string().max(50).optional(),
  company: z.string().max(500).optional(),
  message: z.string().max(2000).optional(),
  source: z.string().max(100).optional(),
  campaign: z.string().max(200).optional(),
  utmSource: z.string().max(200).optional(),
  utmMedium: z.string().max(200).optional(),
  utmCampaign: z.string().max(200).optional(),
});

export const POST = withApiHandler(async ({ request, requestId }) => {
  const body = await request.json();
  const parsed = leadSchema.safeParse(body);

  if (!parsed.success) {
    throw errors.forbidden("Invalid request body.");
  }

  const existingContact = await prisma.contact.findFirst({
    where: { email: parsed.data.email },
  });

  if (existingContact) {
    await auditService.record({
      action: "lead.deduplicated",
      metadata: {
        firstName: parsed.data.firstName,
        email: parsed.data.email,
        existingContactId: existingContact.id,
      },
      requestId,
      resourceId: existingContact.id,
      resourceType: "crm.contact",
    });

    return NextResponse.json({
      data: { id: existingContact.id, deduplicated: true },
      requestId,
    });
  }

  const lead = await prisma.lead.create({
    data: {
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName || null,
      email: parsed.data.email,
      phone: parsed.data.phone || null,
      company: parsed.data.company || null,
      source: "WEBSITE",
      campaign: parsed.data.campaign || null,
      utmSource: parsed.data.utmSource || null,
      utmMedium: parsed.data.utmMedium || null,
      utmCampaign: parsed.data.utmCampaign || null,
      notes: parsed.data.message || null,
    },
  });

  await auditService.record({
    action: "lead.created",
    metadata: {
      firstName: parsed.data.firstName,
      email: parsed.data.email,
      source: "website",
    },
    requestId,
    resourceId: lead.id,
    resourceType: "lead",
  });

  return NextResponse.json({
    data: { id: lead.id },
    requestId,
  });
});
