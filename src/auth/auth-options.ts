import type { NextAuthOptions } from "next-auth";
import type { OAuthConfig } from "next-auth/providers/oauth";

interface IdentityProfile extends Record<string, unknown> {
  sub: string;
  email?: string;
  name?: string;
  preferred_username?: string;
}

function createIdentityProvider(): OAuthConfig<IdentityProfile> {
  const issuer = process.env.AUTH_OIDC_ISSUER;

  return {
    id: "7ice-identity",
    name: "7ice Identity",
    type: "oauth",
    clientId: process.env.AUTH_OIDC_CLIENT_ID,
    clientSecret: process.env.AUTH_OIDC_CLIENT_SECRET,
    wellKnown: issuer ? `${issuer.replace(/\/$/, "")}/.well-known/openid-configuration` : undefined,
    authorization: {
      params: {
        scope: "openid profile email",
      },
    },
    checks: ["pkce", "state"],
    idToken: true,
    profile(profile) {
      return {
        id: profile.sub,
        name: profile.name ?? profile.preferred_username ?? profile.sub,
        email: profile.email ?? null,
      };
    },
  };
}

export const authOptions: NextAuthOptions = {
  secret: process.env.AUTH_SECRET,
  providers: [createIdentityProvider()],
  session: {
    maxAge: 8 * 60 * 60,
    strategy: "jwt",
    updateAge: 15 * 60,
  },
  callbacks: {
    session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }

      return session;
    },
  },
};
