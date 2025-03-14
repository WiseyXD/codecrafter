import { createPrismaClient } from "@repo/db/server";

// Initialize the Prisma client once with the database URL
let prismaInstance: ReturnType<typeof createPrismaClient> | null = null;

export function getPrisma(c: any) {
  if (!prismaInstance) {
    const dbUrl = c.env.DATABASE_URL;
    prismaInstance = createPrismaClient(dbUrl);
  }
  return prismaInstance;
}
