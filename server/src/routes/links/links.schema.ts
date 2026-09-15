import { zValidator } from '@hono/zod-validator'
import { insertLinkSchema } from 'db/schema.js'

import { z } from 'shared'

export const idParamSchema = z.object({
  code: z.string().trim().min(5).max(15),
})

export const linkValidators = {
  create: () => [zValidator('json', insertLinkSchema)] as const,
  update: () =>
    [zValidator('param', idParamSchema), zValidator('json', insertLinkSchema.partial())] as const,
  getById: () => [zValidator('param', idParamSchema)] as const,
}
