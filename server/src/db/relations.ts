import { defineRelations } from 'drizzle-orm'
import { clicks, links } from './schema.js'

export const dbRelations = defineRelations({ links, clicks }, (r) => ({
  links: {
    clicks: r.many.clicks({
      from: r.links.id,
      to: r.clicks.link_id,
    }),
  },
  clicks: {
    link: r.one.links({
      from: r.clicks.link_id,
      to: r.links.id,
    }),
  },
}))
