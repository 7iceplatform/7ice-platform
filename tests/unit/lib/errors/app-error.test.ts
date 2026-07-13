import { describe, expect, it } from "vitest";

import { errors } from "@/lib/errors/app-error";

describe("AppError", () => {
  it("converts a known error to RFC 9457-compatible problem details", () => {
    const error = errors.forbidden();

    expect(error.toProblemDetails("https://7ice.local/api/v1/example", "request-123")).toEqual({
      detail: "You do not have permission to perform this action.",
      instance: "https://7ice.local/api/v1/example",
      requestId: "request-123",
      status: 403,
      title: "Forbidden",
      type: "https://7ice.local/problems/forbidden",
    });
  });
});
