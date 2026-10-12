import type { MiddlewareHandler } from 'hono'
import process from 'node:process'
import pino from 'pino'

// No `transport`: pino spawns a worker thread for it, which workerd does not
// support. Plain JSON on stdout is what Workers log pipelines expect anyway.
const appLogger = pino({
  level: process.env.LOG_LEVEL ?? 'info',
})

export const requestLogger = (): MiddlewareHandler => {
  return async (c, next) => {
    const start = performance.now()

    await next()

    appLogger.info(
      {
        method: c.req.method,
        path: c.req.path,
        status: c.res.status,
        duration_ms: Math.round(performance.now() - start),
      },
      'request completed',
    )
  }
}
