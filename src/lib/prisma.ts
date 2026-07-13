import { PrismaClient } from '@prisma/client';

// Prisma Client singleton.
// Avoids creating multiple client instances during hot-reload in development.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Construct a Prisma client. If DATABASE_URL is missing we still construct the
 * client with a dummy datasource URL so the module loads successfully — queries
 * will simply fail at runtime (connection error). The data-access layer in
 * `src/lib/data.ts` wraps every query in try/catch and degrades to empty data,
 * so the site renders its shell instead of crashing with HTTP 500 when the
 * database is unavailable (e.g. during the deploy window before migrate/seed).
 */
function createPrisma(): PrismaClient {
  const url = process.env.DATABASE_URL;
  if (url) {
    return new PrismaClient();
  }
  return new PrismaClient({
    datasources: {
      db: { url: 'postgresql://user:password@localhost:5432/qtechvending' },
    },
  });
}

export const prisma = globalForPrisma.prisma ?? createPrisma();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
