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
};
