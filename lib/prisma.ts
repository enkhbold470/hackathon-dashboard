// lib/prisma.ts
import { PrismaClient } from '@prisma/client';
import { withAccelerate } from "@prisma/extension-accelerate";

const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClient;
};

function createPrismaClient(): PrismaClient {
  const baseClient = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

  // Add Accelerate extension if needed
  if (
    process.env.DATABASE_URL?.includes("pooled=true") ||
    process.env.DATABASE_URL?.includes("neon.tech")
  ) {
    return baseClient.$extends(withAccelerate()) as unknown as PrismaClient;
    }

  return baseClient;
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
