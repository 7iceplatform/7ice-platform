import type { ProblemDetails } from "@/types/api";

interface AppErrorOptions {
  cause?: unknown;
  detail?: string;
  status: number;
  title: string;
  type: string;
}

export class AppError extends Error {
  readonly detail?: string;
  readonly status: number;
  readonly title: string;
  readonly type: string;

  constructor(message: string, options: AppErrorOptions) {
    super(message, { cause: options.cause });
    this.name = "AppError";
    this.detail = options.detail;
    this.status = options.status;
    this.title = options.title;
    this.type = options.type;
  }

  toProblemDetails(instance: string, requestId: string): ProblemDetails {
    return {
      detail: this.detail,
      instance,
      requestId,
      status: this.status,
      title: this.title,
      type: this.type,
    };
  }
}

export const errors = {
  forbidden: (detail = "You do not have permission to perform this action.") =>
    new AppError("Forbidden", {
      detail,
      status: 403,
      title: "Forbidden",
      type: "https://7ice.local/problems/forbidden",
    }),
  unauthorized: (detail = "Authentication is required to perform this action.") =>
    new AppError("Unauthorized", {
      detail,
      status: 401,
      title: "Unauthorized",
      type: "https://7ice.local/problems/unauthorized",
    }),
  notFound: (detail = "The requested resource was not found.") =>
    new AppError("Not Found", {
      detail,
      status: 404,
      title: "Not Found",
      type: "https://7ice.local/problems/not-found",
    }),
  conflict: (detail = "The request conflicts with the current state of the resource.") =>
    new AppError("Conflict", {
      detail,
      status: 409,
      title: "Conflict",
      type: "https://7ice.local/problems/conflict",
    }),
  validation: (detail = "The request did not pass validation.") =>
    new AppError("Validation Error", {
      detail,
      status: 422,
      title: "Validation Error",
      type: "https://7ice.local/problems/validation",
    }),
  tooManyRequests: (detail = "Too many requests. Please retry later.") =>
    new AppError("Too Many Requests", {
      detail,
      status: 429,
      title: "Too Many Requests",
      type: "https://7ice.local/problems/rate-limit",
    }),
};
