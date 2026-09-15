import { dirname, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { createClient } from '@libsql/client'
import { config } from 'dotenv'
import { drizzle } from 'drizzle-orm/libsql'
import { dbRelations as relations } from './relations.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
config({ path: resolve(__dirname, '../../.env') }) // ← two levels, not three

const dbUrl = process.env.DB_FILE_NAME

if (!dbUrl) {
  throw new Error('DB_FILE_NAME is required to initialize the database client')
}

const client = createClient({
  url: dbUrl,
  authToken: process.env.DB_AUTH_TOKEN,
})

export const db = drizzle({ client, relations, logger: true })
