export interface AuthenticatedActor {
  externalSubject: string;
  id: string;
  tenantId: string | null;
  permissions: string[];
  roles: string[];
}
