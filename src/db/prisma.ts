import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const isPg = (v?: string): v is string => !!v && /^postgres(ql)?:\/\//.test(v);

// Vercel storage integrations expose the connection string under different names,
// sometimes with a custom prefix (e.g. STORAGE_DATABASE_URL). Mirrors scripts/migrate-if-needed.mjs.
function resolveDatabaseUrl(): string | undefined {
  for (const suffix of ["DATABASE_URL", "POSTGRES_PRISMA_URL", "POSTGRES_URL", "URL"]) {
    if (isPg(process.env[suffix])) return process.env[suffix];
    const key = Object.keys(process.env).find((k) => k.endsWith(`_${suffix}`) && isPg(process.env[k]));
    if (key) return process.env[key];
  }
  const key = Object.keys(process.env).find(
    (k) => isPg(process.env[k]) && !/UNPOOLED|NON_POOLING/.test(k),
  );
  return key ? process.env[key] : undefined;
}

const datasourceUrl = resolveDatabaseUrl();

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    ...(datasourceUrl ? { datasourceUrl } : {}),
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
