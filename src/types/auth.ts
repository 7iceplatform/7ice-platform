export interface AuthenticatedActor {
  externalSubject: string;
  id: string;
  permissions: string[];
  roles: string[];
}
