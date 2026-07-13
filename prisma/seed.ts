import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";

import { PERMISSION_DEFINITIONS, ROLE_DEFINITIONS } from "../src/config/permissions";
import { PrismaClient } from "../src/generated/prisma/client";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required to run the seed.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: databaseUrl }),
});

async function main(): Promise<void> {
  await prisma.tenant.upsert({
    where: { code: "default" },
    create: {
      code: "default",
      name: "7ice Platform",
    },
    update: {
      name: "7ice Platform",
    },
  });

  for (const permission of PERMISSION_DEFINITIONS) {
    await prisma.permission.upsert({
      where: { code: permission.code },
      create: {
        code: permission.code,
        description: permission.description,
      },
      update: {
        description: permission.description,
      },
    });
  }

  for (const role of ROLE_DEFINITIONS) {
    const persistedRole = await prisma.role.upsert({
      where: { code: role.code },
      create: {
        code: role.code,
        description: role.description,
        name: role.name,
      },
      update: {
        description: role.description,
        name: role.name,
      },
    });

    for (const permissionCode of role.permissions) {
      const permission = await prisma.permission.findUnique({
        where: { code: permissionCode },
      });

      if (!permission) {
        throw new Error(`Missing permission seed for ${permissionCode}`);
      }

      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            permissionId: permission.id,
            roleId: persistedRole.id,
          },
        },
        create: {
          permissionId: permission.id,
          roleId: persistedRole.id,
        },
        update: {},
      });
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
