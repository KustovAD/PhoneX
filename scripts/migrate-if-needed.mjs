// Runs before `next build` (see package.json "build").
// On Vercel it checks the required env vars, applies Prisma migrations and,
// on the very first deploy, fills the empty database with demo data.
import { spawnSync } from "node:child_process";

const onVercel = Boolean(process.env.VERCEL);

const isPg = (v) => typeof v === "string" && /^postgres(ql)?:\/\//.test(v);

// Vercel storage integrations may add a custom prefix (e.g. STORAGE_DATABASE_URL),
// so match by suffix and fall back to any variable that holds a Postgres URL.
function findUrl(suffixes) {
  for (const suffix of suffixes) {
    if (isPg(process.env[suffix])) return [suffix, process.env[suffix]];
    const key = Object.keys(process.env).find((k) => k.endsWith(`_${suffix}`) && isPg(process.env[k]));
    if (key) return [key, process.env[key]];
  }
  return [null, ""];
}

let [dbKey, dbUrl] = findUrl(["DATABASE_URL", "POSTGRES_PRISMA_URL", "POSTGRES_URL", "URL"]);
if (!dbUrl) {
  const key = Object.keys(process.env).find(
    (k) => isPg(process.env[k]) && !/UNPOOLED|NON_POOLING/.test(k),
  );
  if (key) [dbKey, dbUrl] = [key, process.env[key]];
}

// Migrations need a direct (non-pooled) connection when one is available.
const [directKey, directFound] = findUrl([
  "DIRECT_URL",
  "DATABASE_URL_UNPOOLED",
  "POSTGRES_URL_NON_POOLING",
]);
const directUrl = directFound || dbUrl;

if (dbUrl) {
  console.log(`Using database from ${dbKey}${directFound ? ` (migrations via ${directKey})` : ""}.`);
}

const problems = [];
if (!dbUrl) {
  const related = Object.keys(process.env).filter((k) => /DATABASE|POSTGRES|NEON|^PG/.test(k));
  problems.push(
    "No PostgreSQL connection string found (DATABASE_URL). In Vercel open Storage → Create Database → Neon and connect it to this project for the Production and Preview environments." +
      (related.length ? ` Related variables seen: ${related.join(", ")}.` : " No database variables are set for this environment."),
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
