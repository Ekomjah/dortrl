import { cors } from "hono/cors";
import type { ApiResponse } from "shared";
import { Hono } from 'hono'
import { ReasonPhrases, StatusCodes } from 'shared'
import { requestLogger } from './middleware/logger.js'
import linksRoute from './routes/links/links.routes.js'
import { linksRepository } from './routes/links/links.service.js'
import statsRoute from './routes/stats/stats.routes.js'
import { statsService } from './routes/stats/stats.service.js'

const app = new Hono({ strict: false })
app.use(cors())
app.use(requestLogger())
app.notFound((c) => c.json({ message: ReasonPhrases.NOT_FOUND }, StatusCodes.NOT_FOUND))
app.onError((err, c) => {
  console.error(err)
  return c.json({ message: ReasonPhrases.INTERNAL_SERVER_ERROR }, StatusCodes.INTERNAL_SERVER_ERROR)
})

app.get('/', (c) => {
  return c.json({ id: 1, text: 'Hello Hono!' })
})

app.route('/', statsRoute)
app.route('/links', linksRoute)

app.get('/:code', async (c) => {
  const { code } = c.req.param()
  const link = await linksRepository.getLink(code)

  if (!link) {
    return c.json({ message: ReasonPhrases.NOT_FOUND }, StatusCodes.NOT_FOUND)
  }

  statsService
    .updateClicks(link.id, {
      referrer: c.req.header('referer'),
      userAgent: c.req.header('user-agent'),
      ipAddress: c.req.header('x-forwarded-for'),
    })
    .catch((err) => console.error('Failed to record click:', err))

  return c.redirect(link.original_url, StatusCodes.MOVED_TEMPORARILY)
})
export default app
