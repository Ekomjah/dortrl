import { StatusCodes } from 'shared'
import { beforeEach, describe, expect, it } from 'vitest'
import app from '../src/index.js'
import { auth } from '../src/lib/auth.js'

// Tests use Hono's built-in `app.request()` client (no live server needed).
// They describe the target API contract; endpoints not yet built should fail
// here (RED), driving the implementation.

// /links is behind `requireUser` / `enforceLinkLimit` / `requireFullAccount`,
// so every request to it needs a session cookie. Sign up per test rather than
// once: the shared teardown empties `user` and `session` after every test, so a
// single long-lived session would only survive the first one.
let cookie: string

beforeEach(async () => {
  const res = await auth.api.signUpEmail({
    body: {
      email: `test-${crypto.randomUUID()}@test.local`,
      password: 'Str0ngPassw0rd!',
      name: 'Test User',
    },
    asResponse: true,
  })
  const setCookie = res.headers.get('set-cookie')
  if (!setCookie) throw new Error('sign-up did not return a session cookie')
  cookie = setCookie.split(';')[0]
})

function authed(path: string, init: RequestInit = {}) {
  return app.request(path, {
    ...init,
    headers: { cookie, ...(init.headers ?? {}) },
  })
}

async function createLink(original_url = 'https://example.com/') {
  return authed('/links', {
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
    const res = await authed('/links')
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
    const res = await authed(`/${created.short_code}/stats`)
    expect(res.status).toBe(StatusCodes.OK)
    const body = await res.json()
    expect(body.original_url).toBe('https://stats.test/')
    expect(Array.isArray(body.clicks)).toBe(true)
    expect(body.clicks).toHaveLength(2)
  })
})

describe('authentication', () => {
  it('rejects /links without a session', async () => {
    const res = await app.request('/links')
    expect(res.status).toBe(StatusCodes.UNAUTHORIZED)
  })

  it('rejects link creation without a session', async () => {
    const res = await app.request('/links', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ original_url: 'https://unauth.test/' }),
    })
    expect(res.status).toBe(StatusCodes.UNAUTHORIZED)
  })

  it('scopes the link list to the signed-in user', async () => {
    const res = await authed('/links')
    expect(res.status).toBe(StatusCodes.OK)
    for (const link of await res.json()) {
      expect(typeof link.user_id).toBe('string')
    }
  })
})

describe('dELETE /links/:code', () => {
  it('deletes a link and its code stops resolving', async () => {
    const created = await (await createLink('https://del.test/')).json()
    const del = await authed(`/links/${created.short_code}`, { method: 'DELETE' })
    expect(del.status).toBe(StatusCodes.NO_CONTENT)
    const after = await app.request(`/${created.short_code}`)
    expect(after.status).toBe(StatusCodes.NOT_FOUND)
  })

  it('returns "not found" when deleting an unknown code', async () => {
    const res = await authed('/links/unknown-code', { method: 'DELETE' })
    expect(res.status).toBe(StatusCodes.NOT_FOUND)
  })
})
