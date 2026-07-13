import pino, { type Bindings, type Logger } from "pino";

import { getServerEnvironment } from "@/config/env";

const redactedPaths = [
  "authorization",
  "cookie",
  "password",
  "token",
  "req.headers.authorization",
  "req.headers.cookie",
];

let rootLogger: Logger | undefined;

function getRootLogger(): Logger {
  if (!rootLogger) {
    const environment = getServerEnvironment();

    rootLogger = pino({
      base: {
        service: "7ice-platform",
      },
      level: environment.LOG_LEVEL,
      redact: {
        censor: "[REDACTED]",
        paths: redactedPaths,
      },
      timestamp: pino.stdTimeFunctions.isoTime,
    });
  }

  return rootLogger;
}

export function createLogger(bindings: Bindings = {}): Logger {
  return getRootLogger().child(bindings);
}
