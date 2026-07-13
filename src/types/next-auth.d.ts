import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      email?: string | null;
      id: string;
      image?: string | null;
      name?: string | null;
      permissions: string[];
      roles: string[];
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    permissions?: string[];
    roles?: string[];
  }
}
