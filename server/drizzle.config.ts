import { defineConfig } from 'drizzle-kit'
import 'dotenv/config'
export default defineConfig({
  out: './drizzle/migrations',
  schema: './src/db/schema.ts',
  dialect: 'turso',
  dbCredentials: {
    url: process.env.DB_FILE_NAME! as string,
    // authToken: process.env.DB_AUTH_TOKEN!, // ← uncomment for remote Turso
  },
  verbose: true,
  strict: true,
})
