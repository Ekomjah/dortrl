import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

// Mirrors the `@/*` -> `src/*` path alias in tsconfig.json. The `.js` form is
// mapped to its TypeScript source because the app imports use ESM extensions.
const srcDir = fileURLToPath(new URL('./src/', import.meta.url))

// Resolve the `shared` workspace import that the app source uses. The package
// entrypoint is `dist`, but tests run against the TypeScript source directly.
const sharedIndex = fileURLToPath(new URL('../shared/src/index.ts', import.meta.url))

export default defineConfig({
  resolve: {
    alias: [
      { find: /^@\/(.*)\.js$/, replacement: `${srcDir}$1.ts` },
      { find: /^@\//, replacement: srcDir },
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
