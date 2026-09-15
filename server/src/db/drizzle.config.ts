import { resolve } from 'node:path'
import process from 'node:process'
import { config } from 'dotenv'
import { defineConfig } from 'drizzle-kit'

// explicitly point to root .env
config({ path: resolve(__dirname, '../../.env') })
export default defineConfig({
  out: './drizzle/migrations',
  schema: './schema.ts',
  dialect: 'turso',
  dbCredentials: {
    url: process.env.DB_FILE_NAME! as string,
    // authToken: process.env.DB_AUTH_TOKEN!, // ← uncomment for remote Turso
  },
  verbose: true,
  strict: true,
})
