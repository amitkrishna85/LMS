import { spawnSync } from "node:child_process";
import path from "node:path";

if (process.env.VERCEL_ENV !== "production") {
  process.exit(0);
}

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be configured for production deployments.");
}

process.env.DIRECT_URL =
  process.env.DIRECT_URL ||
  process.env.PRISMA_DATABASE_URL ||
  process.env.DATABASE_URL;

const prismaCli = path.join(
  process.cwd(),
  "node_modules",
  "prisma",
  "build",
  "index.js"
);
const result = spawnSync(
  process.execPath,
  [prismaCli, "migrate", "deploy"],
  { stdio: "inherit", env: process.env }
);

if (result.error) {
  throw result.error;
}

if (result.status === null) {
  throw new Error("Prisma migration process did not exit normally.");
}

process.exit(result.status);
