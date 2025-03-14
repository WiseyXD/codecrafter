import { PrismaClient } from "@prisma/client";

export function createPrismaClient(dbUrl: string) {
  return new PrismaClient({
    datasources: {
      db: {
        url: dbUrl,
      },
    },
  });
}
