import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { AppError } from "@/lib/errors/app-error";
import { createLogger } from "@/lib/logging/logger";
import type { ProblemDetails } from "@/types/api";

interface ApiHandlerContext {
  request: NextRequest;
  requestId: string;
  params?: Record<string, string>;
}

type ApiHandler = (context: ApiHandlerContext) => Promise<Response> | Response;

function problemResponse(problem: ProblemDetails, status: number): NextResponse<ProblemDetails> {
  return NextResponse.json(problem, {
    headers: {
      "cache-control": "no-store",
      "content-type": "application/problem+json",
      "x-request-id": problem.requestId,
    },
    status,
  });
}

export function withApiHandler(handler: ApiHandler) {
  return async function apiHandler(
    request: NextRequest,
    context: { params?: Promise<Record<string, string>> },
  ): Promise<Response> {
    const requestId = request.headers.get("x-request-id") ?? crypto.randomUUID();
    const logger = createLogger({ requestId });

    try {
      const resolvedParams = context.params ? await context.params : undefined;
      const response = await handler({ request, requestId, params: resolvedParams });
      response.headers.set("x-request-id", requestId);
      return response;
    } catch (error) {
      if (error instanceof AppError) {
        logger.warn({ error, status: error.status }, "Handled API error");
        return problemResponse(error.toProblemDetails(request.url, requestId), error.status);
      }

      if (error instanceof ZodError) {
        logger.info({ error }, "Invalid API request");
        return problemResponse(
          {
            detail: "The request did not pass validation.",
            instance: request.url,
            requestId,
            status: 400,
            title: "Invalid request",
            type: "https://7ice.local/problems/validation",
          },
          400,
        );
      }

      logger.error({ error }, "Unhandled API error");
      return problemResponse(
        {
          instance: request.url,
          requestId,
          status: 500,
          title: "Internal server error",
          type: "https://7ice.local/problems/internal",
        },
        500,
      );
    }
  };
}
