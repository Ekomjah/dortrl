import type { Client } from "@libsql/client";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { createClient } from "@libsql/client";
import { afterAll, afterEach, beforeAll } from "vitest";

// Point the app's db client at a throwaway sqlite file BEFORE it is imported.
// dotenv (loaded inside db/client) does not override already-set env vars, so
// this wins over the repo `.env`.
const dbPath = join(tmpdir(), `quickrl-hono-test-${process.pid}.db`);
process.env.DB_FILE_NAME = `file:${dbPath}`;
process.env.DB_AUTH_TOKEN = "";
process.env.APP_ENV = "test";

// Load the generated drizzle migration and apply it to the test db so tables
// exist. Statements are separated by the drizzle breakpoint marker.
const migrationsDir = fileURLToPath(
  new URL("../../db/drizzle/migrations", import.meta.url),
);
const migrationName = readdirSync(migrationsDir).find((name) =>
  statSync(join(migrationsDir, name)).isDirectory(),
)!;
const migrationSql = readFileSync(
  join(migrationsDir, migrationName, "migration.sql"),
  "utf8",
);
const statements = migrationSql
  .split("--> statement-breakpoint")
  .map((s) => s.trim())
  .filter(Boolean);

let client: Client;

beforeAll(async () => {
  client = createClient({ url: `file:${dbPath}` });
  await client.execute("DROP TABLE IF EXISTS clicks");
  await client.execute("DROP TABLE IF EXISTS links");
  for (const stmt of statements) {
    await client.execute(stmt);
  }
});

afterEach(async () => {
  await client.execute("DELETE FROM clicks");
  await client.execute("DELETE FROM links");
});

afterAll(() => {
  client?.close();
});
