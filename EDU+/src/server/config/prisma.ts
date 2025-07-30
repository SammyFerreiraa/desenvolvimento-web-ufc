import { drizzle } from "drizzle-orm/prisma/pg";
import { env } from "@/config/env";
import { PrismaClient } from "@prisma/client";

const createPrismaClient = () =>
   new PrismaClient({
      log: env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"]
   }).$extends(drizzle());

const globalForPrisma = globalThis as unknown as {
   prisma: ReturnType<typeof createPrismaClient> | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
