import { fileURLToPath } from "node:url";
import { cloudflareTest } from "@cloudflare/vitest-pool-workers";
import { defineConfig } from "vitest/config";

const srcDir = fileURLToPath(new URL("./src/", import.meta.url));
const sharedIndex = fileURLToPath(
  new URL("../shared/src/index.ts", import.meta.url),
);
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const migrationsDir = fileURLToPath(
  new URL("./drizzle/migrations", import.meta.url),
);
const migrationStatements = readdirSync(migrationsDir, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name)
  .sort()
  .flatMap((name) =>
    readFileSync(join(migrationsDir, name, "migration.sql"), "utf8")
      .split("--> statement-breakpoint")
      .map((s) => s.trim())
      .filter(Boolean),
  );

export default defineConfig({
  plugins: [
    cloudflareTest({
      wrangler: { configPath: "./wrangler.jsonc" },
      miniflare: {
        compatibilityDate: "2026-08-22",
        bindings: { TEST_MIGRATIONS: JSON.stringify(migrationStatements) },
        // Override the production quota for tests. The binding must stay
        // present (the middleware calls it unguarded) - removing it would
        // turn every link creation into a 500.
        ratelimits: {
          LINK_RATE_LIMITER: {
            namespace_id: "1001",
            simple: { limit: 100_000, period: 60 },
          },
        },
      },
    }),
  ],
  resolve: {
    alias: [
      { find: /^@\/(.*)\.js$/, replacement: `${srcDir}$1.ts` },
      { find: /^@\//, replacement: srcDir },
      { find: /^shared$/, replacement: sharedIndex },
    ],
  },
  test: {
    include: ["test/**/*.test.ts"],
    setupFiles: ["./test/setup.ts"],
    hookTimeout: 30000,
  },
});
