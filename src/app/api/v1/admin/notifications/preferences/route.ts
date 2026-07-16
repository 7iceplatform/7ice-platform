import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentActor } from "@/auth/current-actor";
import { prisma } from "@/server/db/prisma";
import { withApiHandler } from "@/lib/http/with-api-handler";
import { errors } from "@/lib/errors/app-error";

export const dynamic = "force-dynamic";

const preferencesSchema = z.object({
  quietHoursStart: z.string().optional(),
  quietHoursEnd: z.string().optional(),
  timezone: z.string().optional(),
  inAppEnabled: z.boolean().optional(),
  emailEnabled: z.boolean().optional(),
  smsEnabled: z.boolean().optional(),
  pushEnabled: z.boolean().optional(),
});

export const GET = withApiHandler(async ({ requestId }) => {
  const actor = await getCurrentActor();
  if (!actor) throw errors.unauthorized();

  const prefs = await prisma.notificationPreference.findUnique({
    where: { userId: actor.id },
  });

  return NextResponse.json({
    data: prefs ?? {
      quietHoursStart: null,
      quietHoursEnd: null,
      timezone: "Europe/Moscow",
      inAppEnabled: true,
      emailEnabled: false,
      smsEnabled: false,
      pushEnabled: false,
    },
    requestId,
  });
});

export const PUT = withApiHandler(async ({ request, requestId }) => {
  const actor = await getCurrentActor();
  if (!actor) throw errors.unauthorized();

  const body = await request.json();
  const parsed = preferencesSchema.safeParse(body);
  if (!parsed.success) throw errors.forbidden("Invalid request body.");

  const prefs = await prisma.notificationPreference.upsert({
    where: { userId: actor.id },
    create: {
      userId: actor.id,
      quietHoursStart: parsed.data.quietHoursStart ?? null,
      quietHoursEnd: parsed.data.quietHoursEnd ?? null,
      timezone: parsed.data.timezone ?? "Europe/Moscow",
      inAppEnabled: parsed.data.inAppEnabled ?? true,
      emailEnabled: parsed.data.emailEnabled ?? false,
      smsEnabled: parsed.data.smsEnabled ?? false,
      pushEnabled: parsed.data.pushEnabled ?? false,
    },
    update: {
      ...(parsed.data.quietHoursStart !== undefined && { quietHoursStart: parsed.data.quietHoursStart || null }),
      ...(parsed.data.quietHoursEnd !== undefined && { quietHoursEnd: parsed.data.quietHoursEnd || null }),
      ...(parsed.data.timezone !== undefined && { timezone: parsed.data.timezone }),
      ...(parsed.data.inAppEnabled !== undefined && { inAppEnabled: parsed.data.inAppEnabled }),
      ...(parsed.data.emailEnabled !== undefined && { emailEnabled: parsed.data.emailEnabled }),
      ...(parsed.data.smsEnabled !== undefined && { smsEnabled: parsed.data.smsEnabled }),
      ...(parsed.data.pushEnabled !== undefined && { pushEnabled: parsed.data.pushEnabled }),
    },
  });

  return NextResponse.json({ data: prefs, requestId });
});
