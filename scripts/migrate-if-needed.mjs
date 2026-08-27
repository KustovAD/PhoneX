import { spawnSync } from "node:child_process";

const url = process.env.DATABASE_URL ?? "";

if (!url.startsWith("postgres")) {
  console.warn(
    "Skipping prisma migrate deploy: DATABASE_URL is missing or is not a PostgreSQL URL. On Vercel, set DATABASE_URL to a Neon/Postgres connection string.",
  );
  process.exit(0);
}

const result = spawnSync("npx", ["prisma", "migrate", "deploy"], {
  stdio: "inherit",
  shell: true,
});

process.exit(result.status ?? 1);
