import { StatusCodes } from 'shared'
import { describe, expect, it } from 'vitest'
import app from '../src/index.js'

// Tests use Hono's built-in `app.request()` client (no live server needed).
// They describe the target API contract; endpoints not yet built should fail
// here (RED), driving the implementation.

async function createLink(original_url = 'https://example.com/') {
  return app.request('/links', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ original_url }),
  })
}

describe('gET /health', () => {
  it('reports ok status with a healthy database probe', async () => {
    const res = await app.request('/health')
    expect(res.status).toBe(StatusCodes.OK)

    const body = await res.json()
    expect(body).toMatchObject({
      status: 'ok',
      database: { status: 'ok' },
    })
    expect(typeof body.timestamp).toBe('string')
    expect(Number.isNaN(Date.parse(body.timestamp))).toBe(false)
    expect(typeof body.database.latencyMs).toBe('number')
    expect(body.database.latencyMs).toBeGreaterThanOrEqual(0)
  })
})

describe('pOST /links', () => {
  it('creates a short link with a short_code', async () => {
    const res = await createLink('https://example.com/foo')
    expect(res.status).toBe(StatusCodes.CREATED)
    const body = await res.json()
    expect(body.original_url).toBe('https://example.com/foo')
    expect(typeof body.short_code).toBe('string')
    expect(body.short_code.length).toBeGreaterThan(0)
  })
})

describe('gET /links', () => {
  it('lists all created links', async () => {
    await createLink('https://a.test/')
    await createLink('https://b.test/')
    const res = await app.request('/links')
    expect(res.status).toBe(StatusCodes.OK)
    const body = await res.json()
    expect(Array.isArray(body)).toBe(true)
    expect(body).toHaveLength(2)
  })
})

describe('gET /:code (redirect)', () => {
  it('redirects to the original url', async () => {
    const created = await (await createLink('https://redirect.test/')).json()
    const res = await app.request(`/${created.short_code}`)
    expect([
      StatusCodes.MOVED_PERMANENTLY,
      StatusCodes.MOVED_TEMPORARILY,
      StatusCodes.TEMPORARY_REDIRECT,
      StatusCodes.PERMANENT_REDIRECT,
    ]).toContain(res.status)
    expect(res.headers.get('location')).toBe('https://redirect.test/')
  })

  it('returns not found for an unknown code', async () => {
    const res = await app.request('/definitely-not-a-real-code')
    expect(res.status).toBe(StatusCodes.NOT_FOUND)
  })
})

describe('gET /:code/stats', () => {
  it('returns the click count for a link', async () => {
    const created = await (await createLink('https://stats.test/')).json()
    await app.request(`/${created.short_code}`)
    await app.request(`/${created.short_code}`)
    const res = await app.request(`/${created.short_code}/stats`)
    expect(res.status).toBe(StatusCodes.OK)
    expect(await res.json()).toMatchObject({ clicks: 2 })
  })
})

describe('dELETE /links/:code', () => {
  it('deletes a link and its code stops resolving', async () => {
    const created = await (await createLink('https://del.test/')).json()
    const del = await app.request(`/links/${created.short_code}`, { method: 'DELETE' })
    expect(del.status).toBe(StatusCodes.NO_CONTENT)
    const after = await app.request(`/${created.short_code}`)
    expect(after.status).toBe(StatusCodes.NOT_FOUND)
  })

  it('returns "not found" when deleting an unknown code', async () => {
    const res = await app.request('/links/unknown-code', { method: 'DELETE' })
    expect(res.status).toBe(StatusCodes.NOT_FOUND)
  })
})
