import { z } from "zod";

const serverEnvironmentSchema = z.object({
  APP_URL: z.url(),
  AUTH_OIDC_CLIENT_ID: z.string().min(1),
  AUTH_OIDC_CLIENT_SECRET: z.string().min(1),
  AUTH_OIDC_ISSUER: z.url(),
  AUTH_SECRET: z.string().min(32),
  DATABASE_URL: z.url(),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace"]).default("info"),
  NEXTAUTH_URL: z.url(),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

export type ServerEnvironment = z.infer<typeof serverEnvironmentSchema>;

let environment: ServerEnvironment | undefined;

export function getServerEnvironment(): ServerEnvironment {
  if (!environment) {
    environment = serverEnvironmentSchema.parse({
      APP_URL: process.env.APP_URL,
      AUTH_OIDC_CLIENT_ID: process.env.AUTH_OIDC_CLIENT_ID,
      AUTH_OIDC_CLIENT_SECRET: process.env.AUTH_OIDC_CLIENT_SECRET,
      AUTH_OIDC_ISSUER: process.env.AUTH_OIDC_ISSUER,
      AUTH_SECRET: process.env.AUTH_SECRET,
      DATABASE_URL: process.env.DATABASE_URL,
      LOG_LEVEL: process.env.LOG_LEVEL,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      NODE_ENV: process.env.NODE_ENV,
    });
  }

  return environment;
}
