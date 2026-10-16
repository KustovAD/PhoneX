// Runs before `next build` (see package.json "build").
// On Vercel it checks the required env vars, applies Prisma migrations and,
// on the very first deploy, fills the empty database with demo data.
import { spawnSync } from "node:child_process";

const onVercel = Boolean(process.env.VERCEL);

const dbUrl =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL ||
  "";

// Migrations need a direct (non-pooled) connection when one is available.
const directUrl =
  process.env.DIRECT_URL ||
  process.env.DATABASE_URL_UNPOOLED ||
  process.env.POSTGRES_URL_NON_POOLING ||
  dbUrl;

const problems = [];
if (!dbUrl.startsWith("postgres")) {
  problems.push(
    "DATABASE_URL is missing or is not a PostgreSQL URL. In Vercel open Storage → Create Database → Neon and connect it to this project.",
  );
}
if (!process.env.AUTH_SECRET && !process.env.NEXTAUTH_SECRET) {
  problems.push(
    "AUTH_SECRET is missing. Add it in Settings → Environment Variables (any random string of 32+ characters, e.g. from `openssl rand -base64 32`).",
  );
}

if (problems.length > 0) {
  const message = problems.map((p) => `  • ${p}`).join("\n");
  if (onVercel) {
    console.error(`\n✖ PhoneX cannot be deployed yet:\n${message}\n\nThen redeploy.\n`);
    process.exit(1);
  }
  console.warn(`Skipping database setup:\n${message}`);
  process.exit(0);
}

const env = { ...process.env, DATABASE_URL: directUrl };

function run(cmd, args) {
  const result = spawnSync(cmd, args, { stdio: "inherit", shell: true, env });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

run("npx", ["prisma", "migrate", "deploy"]);

if (process.env.SKIP_AUTO_SEED === "1") process.exit(0);

const { PrismaClient } = await import("@prisma/client");
const prisma = new PrismaClient({ datasourceUrl: directUrl });
let isEmpty = false;
try {
  isEmpty = (await prisma.role.count()) === 0;
} finally {
  await prisma.$disconnect();
}

if (isEmpty) {
  console.log("Database is empty — seeding demo data…");
  run("npx", ["tsx", "prisma/seed.ts"]);
} else {
  console.log("Database already has data — skipping seed.");
}
