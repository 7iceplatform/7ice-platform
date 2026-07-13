import { NextResponse } from "next/server";

import { withApiHandler } from "@/lib/http/with-api-handler";

export const dynamic = "force-dynamic";

export const GET = withApiHandler(async ({ requestId }) =>
  NextResponse.json({ service: "7ice-platform", status: "ready", requestId }),
);
