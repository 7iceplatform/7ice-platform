import { getServerSession } from "next-auth";

import { authOptions } from "@/auth/auth-options";
import { findActorByExternalSubject } from "@/server/services/actor-service";
import type { AuthenticatedActor } from "@/types/auth";

export async function getCurrentActor(): Promise<AuthenticatedActor | null> {
  const session = await getServerSession(authOptions);
  const externalSubject = session?.user?.id;

  if (!externalSubject) {
    return null;
  }

  return findActorByExternalSubject(externalSubject);
}
