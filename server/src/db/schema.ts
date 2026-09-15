  import type { z } from 'zod'
  import { sql } from 'drizzle-orm'
  import { check, index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
  import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
  import { generateId } from 'shared'

  export const links = sqliteTable(
    'links',
    {
      id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
      short_code: text('short_code')
        .unique()
        .$defaultFn(() => generateId(15))
        .notNull(),
      original_url: text('original_url').notNull(),
      created_at: integer('created_at', { mode: 'timestamp' })
        .notNull()
        .default(sql`(unixepoch())`),
      expires_at: integer('expires_at', { mode: 'timestamp' })
        .notNull()
        .default(sql`(unixepoch('now', '+5 days'))`),
    },
    (table) => [
      index('original_url_idx').on(table.original_url),
      check(
        'short_code_length',
        sql`length(${table.short_code}) >= 5 AND length(${table.short_code}) <= 15`,
      ),
    ],
  )

  export const clicks = sqliteTable('clicks', {
    id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
    link_id: integer('link_id', { mode: 'number' })
      .notNull()
      .references(() => links.id),
    clicked_at: integer('clicked_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
    referrer: text('referrer'),
    user_agent: text('user_agent'),
    ip_address: text('ip_address'),
  })

  export type NewLink = typeof links.$inferInsert
  export type SelectLink = typeof links.$inferSelect
  export type InsertLink = Pick<NewLink, 'original_url' | 'short_code'>
  export const insertLinkSchema = createInsertSchema(links, {
    original_url: (schema: z.ZodString) => schema.trim().url(),
    short_code: (schema: z.ZodString) => schema.trim().min(5).max(15),
  }).pick({
    original_url: true,
    short_code: true,
  })
  export const UpdateLinkSchema = insertLinkSchema.partial()
  export const selectLinkSchema = createSelectSchema(links)

  export type Click = typeof clicks.$inferInsert
  export type SelectClick = Omit<Click, 'link_id' | 'id'>
  export type InsertClicks = Omit<Click, 'id' | 'clicked_at'>
