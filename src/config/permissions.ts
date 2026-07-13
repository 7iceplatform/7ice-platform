export const PERMISSIONS = {
  ADMIN_ACCESS: "admin.access",
  ADMIN_USERS_READ: "admin.users.read",
  ADMIN_USERS_MANAGE: "admin.users.manage",
  ADMIN_AUDIT_READ: "admin.audit.read",
} as const;

export type PermissionCode = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const ROLES = {
  ADMINISTRATOR: "administrator",
} as const;

export type RoleCode = (typeof ROLES)[keyof typeof ROLES];

export const PERMISSION_DEFINITIONS: ReadonlyArray<{
  code: PermissionCode;
  description: string;
}> = [
  { code: PERMISSIONS.ADMIN_ACCESS, description: "Access the administration panel" },
  { code: PERMISSIONS.ADMIN_USERS_READ, description: "View users and role assignments" },
  { code: PERMISSIONS.ADMIN_USERS_MANAGE, description: "Manage users and role assignments" },
  { code: PERMISSIONS.ADMIN_AUDIT_READ, description: "View audit records" },
];

export const ROLE_DEFINITIONS: ReadonlyArray<{
  code: RoleCode;
  description: string;
  name: string;
  permissions: PermissionCode[];
}> = [
  {
    code: ROLES.ADMINISTRATOR,
    description: "Full administration access for the 7ice platform",
    name: "Administrator",
    permissions: [
      PERMISSIONS.ADMIN_ACCESS,
      PERMISSIONS.ADMIN_USERS_READ,
      PERMISSIONS.ADMIN_USERS_MANAGE,
      PERMISSIONS.ADMIN_AUDIT_READ,
    ],
  },
];
