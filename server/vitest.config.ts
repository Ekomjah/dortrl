import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

// Resolve monorepo path-alias imports (`db`, `db/*.js`, `shared`) that the app
// source uses. These map to TS sources one level up in `packages/`.
const dbDir = fileURLToPath(new URL('../db/', import.meta.url))
const dbClient = fileURLToPath(new URL('../db/client.ts', import.meta.url))
const sharedIndex = fileURLToPath(new URL('../shared/index.ts', import.meta.url))

export default defineConfig({
  resolve: {
    alias: [
      { find: /^db$/, replacement: dbClient },
      { find: /^db\/(.*)\.js$/, replacement: `${dbDir}$1.ts` },
      { find: /^shared$/, replacement: sharedIndex },
    ],
  },
  test: {
    include: ['test/**/*.test.ts'],
    setupFiles: ['./test/setup.ts'],
    isolate: true,
    pool: 'forks',
  },
})
