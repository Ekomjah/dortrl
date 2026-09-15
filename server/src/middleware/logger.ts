import type { MiddlewareHandler } from 'hono'
import process from 'node:process'
import pino from 'pino'

const environment = process.env.APP_ENV ?? 'development'

const appLogger = pino({
  level: process.env.LOG_LEVEL ?? 'info',
  transport:
    environment === 'development'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
          },
        }
      : undefined,
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
