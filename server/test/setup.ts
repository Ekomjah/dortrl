import type { Client } from "@libsql/client";
import { tmpdir } from "node:os";
import { join } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import { afterAll, afterEach, beforeAll } from "vitest";

// Point the app's db client at a throwaway sqlite file BEFORE it is imported.
// dotenv (loaded inside db/client) does not override already-set env vars, so
// this wins over the repo `.env`.
const dbPath = join(tmpdir(), `quickrl-hono-test-${process.pid}.db`);
process.env.DB_FILE_NAME = `file:${dbPath}`;
process.env.DB_AUTH_TOKEN = "";
process.env.APP_ENV = "test";

// Migrations are applied in order by drizzle's own migrator, which sorts the
// migration folders by name and skips any already recorded in the journal table.
const migrationsDir = fileURLToPath(
  new URL("../drizzle/migrations", import.meta.url),
);

let client: Client;

const TABLES_IN_DROP_ORDER = [
  "clicks",
  "account",
  "session",
  "verification",
  "links",
  "user",
] as const;

async function existingTables(): Promise<Set<string>> {
  const res = await client.execute(
    "SELECT name FROM sqlite_master WHERE type='table'",
  );
  return new Set(res.rows.map((row) => String(row.name)));
}

beforeAll(async () => {
  client = createClient({ url: `file:${dbPath}` });
  for (const table of TABLES_IN_DROP_ORDER) {
    await client.execute(`DROP TABLE IF EXISTS \`${table}\``);
  }
  await migrate(drizzle({ client }), { migrationsFolder: migrationsDir });
});

afterEach(async () => {
  const present = await existingTables();
  for (const table of TABLES_IN_DROP_ORDER) {
    if (present.has(table)) {
      await client.execute(`DELETE FROM \`${table}\``);
    }
  }
});

afterAll(() => {
  client?.close();
});
