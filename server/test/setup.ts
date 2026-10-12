import { env } from "cloudflare:workers";
import { afterEach, beforeAll, vi } from "vitest";

// `hono/bun` destructures the `Bun` global at module scope, which doesn't
// exist in workerd. Only `getConnInfo` is used, so stand in a fixed address.
vi.mock("hono/bun", () => ({
  getConnInfo: () => ({ remote: { address: "127.0.0.1" } }),
}));

const TABLES_IN_DELETE_ORDER = [
  "clicks",
  "account",
  "session",
  "verification",
  "links",
  "user",
] as const;

beforeAll(async () => {
  const statements: string[] = JSON.parse(
    (env as unknown as { TEST_MIGRATIONS: string }).TEST_MIGRATIONS,
  );
  await env.DB.batch(statements.map((sql) => env.DB.prepare(sql)));
});

afterEach(async () => {
  await env.DB.batch(
    TABLES_IN_DELETE_ORDER.map((t) => env.DB.prepare(`DELETE FROM \`${t}\``)),
  );
});