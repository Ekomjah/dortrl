import { StatusCodes } from "shared";
import { beforeEach, describe, expect, it } from "vitest";
import { app } from "../src/index.js";
import { auth } from "../src/lib/auth.js";

// Tests use Hono's built-in `app.request()` client (no live server needed).
// They describe the target API contract; endpoints not yet built should fail
// here (RED), driving the implementation.

// /api/links is behind `requireUser` / `enforceLinkLimit` / `requireFullAccount`,
// so every request to it needs a session cookie. Sign up per test rather than
// once: the shared teardown empties `user` and `session` after every test, so a
// single long-lived session would only survive the first one.
let cookie: string;

beforeEach(async () => {
  const res = await auth.api.signUpEmail({
    body: {
      email: `test-${crypto.randomUUID()}@test.local`,
      password: "Str0ngPassw0rd!",
      name: "Test User",
    },
    asResponse: true,
  });
  const setCookie = res.headers.get("set-cookie");
  if (!setCookie) throw new Error("sign-up did not return a session cookie");
  cookie = setCookie.split(";")[0];
});

function authed(path: string, init: RequestInit = {}) {
  return app.request(path, {
    ...init,
    headers: { cookie, ...(init.headers ?? {}) },
  });
}

async function createLink(original_url = "https://example.com/") {
  return authed("/api/links", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ original_url }),
  });
}

describe("gET /health", () => {
  it("reports ok status with a healthy database probe", async () => {
    const res = await app.request("/health");
    expect(res.status).toBe(StatusCodes.OK);

    const body = await res.json();
    expect(body).toMatchObject({
      status: "ok",
      database: { status: "ok" },
    });
    expect(typeof body.timestamp).toBe("string");
    expect(Number.isNaN(Date.parse(body.timestamp))).toBe(false);
    expect(typeof body.database.latencyMs).toBe("number");
    expect(body.database.latencyMs).toBeGreaterThanOrEqual(0);
  });
});

describe("pOST /api/links", () => {
  it("creates a short link with a short_code", async () => {
    const res = await createLink("https://example.com/foo");
    expect(res.status).toBe(StatusCodes.CREATED);
    const body = await res.json();
    expect(body.original_url).toBe("https://example.com/foo");
    expect(typeof body.short_code).toBe("string");
    expect(body.short_code.length).toBeGreaterThan(0);
  });
});

describe("link_text addressing", () => {
  async function createWithText(url: string, link_text?: string) {
    const res = await authed("/api/links", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ original_url: url, link_text }),
    });
    return res;
  }

  it("resolves both the link_text and the short_code to the same row", async () => {
    const res = await createWithText("https://dual.test/", "my-slug");
    expect(res.status).toBe(StatusCodes.CREATED);
    const body = await res.json();
    expect(body.link_text).toBe("my-slug");

    const viaText = await app.request("/my-slug");
    const viaCode = await app.request(`/${body.short_code}`);
    expect(viaText.status).toBe(StatusCodes.MOVED_TEMPORARILY);
    expect(viaCode.status).toBe(StatusCodes.MOVED_TEMPORARILY);
    expect(viaText.headers.get("location")).toBe("https://dual.test/");
    expect(viaCode.headers.get("location")).toBe("https://dual.test/");
  });

  it("still resolves the short_code when no link_text is given", async () => {
    const res = await createWithText("https://codeonly.test/");
    expect(res.status).toBe(StatusCodes.CREATED);
    const body = await res.json();
    expect(body.link_text).toBeNull();

    const viaCode = await app.request(`/${body.short_code}`);
    expect(viaCode.status).toBe(StatusCodes.MOVED_TEMPORARILY);
    expect(viaCode.headers.get("location")).toBe("https://codeonly.test/");
  });

  it("preserves the case of link_text", async () => {
    const res = await createWithText("https://mixedcase.test/", "MySlug");
    expect(res.status).toBe(StatusCodes.CREATED);
    expect((await res.json()).link_text).toBe("MySlug");

    const viaExact = await app.request("/MySlug");
    expect(viaExact.status).toBe(StatusCodes.MOVED_TEMPORARILY);
  });

  it("rejects a link_text already used by another link", async () => {
    expect((await createWithText("https://first.test/", "taken")).status).toBe(
      StatusCodes.CREATED,
    );
    const second = await createWithText("https://second.test/", "taken");
    expect(second.status).toBe(StatusCodes.CONFLICT);
  });

  it("rejects a link_text that collides with an existing short_code", async () => {
    const first = await (await createWithText("https://collide.test/")).json();
    const second = await createWithText(
      "https://collide2.test/",
      first.short_code,
    );
    expect(second.status).toBe(StatusCodes.CONFLICT);
  });

  it("rejects reserved link_text values", async () => {
    for (const reserved of ["health", "links", "stats"]) {
      const res = await createWithText(
        `https://reserved-${reserved}.test/`,
        reserved,
      );
      expect(res.status, reserved).toBe(StatusCodes.CONFLICT);
    }
  });

  it("rejects a link_text outside the short_code length rules", async () => {
    // `api` is reserved but also too short, so length rejects it first.
    const short = await createWithText("https://tooshort.test/", "api");
    expect(short.status).toBe(StatusCodes.BAD_REQUEST);
  });

  it("rejects a duplicate short_code on update with a conflict", async () => {
    const a = await (await createWithText("https://upd-a.test/")).json();
    const b = await (await createWithText("https://upd-b.test/")).json();
    const res = await authed(`/api/links/${b.short_code}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ short_code: a.short_code }),
    });
    expect(res.status).toBe(StatusCodes.CONFLICT);
  });

  it("serves stats by short_code only, never by link_text", async () => {
    const body = await (
      await createWithText("https://statsby.test/", "statstext")
    ).json();
    await app.request(`/${body.short_code}`);
    const byCode = await authed(`/api/${body.short_code}/stats`);
    expect(byCode.status).toBe(StatusCodes.OK);

    const byText = await authed("/api/statstext/stats");
    expect(byText.status).toBe(StatusCodes.NOT_FOUND);
  });
});

describe("gET /api/links", () => {
  it("lists all created links", async () => {
    await createLink("https://a.test/");
    await createLink("https://b.test/");
    const res = await authed("/api/links");
    expect(res.status).toBe(StatusCodes.OK);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body).toHaveLength(2);
  });
});

describe("gET /:code (redirect)", () => {
  it("redirects to the original url", async () => {
    const created = await (await createLink("https://redirect.test/")).json();
    const res = await app.request(`/${created.short_code}`);
    expect([
      StatusCodes.MOVED_PERMANENTLY,
      StatusCodes.MOVED_TEMPORARILY,
      StatusCodes.TEMPORARY_REDIRECT,
      StatusCodes.PERMANENT_REDIRECT,
    ]).toContain(res.status);
    expect(res.headers.get("location")).toBe("https://redirect.test/");
  });

  it("redirects an unknown code to the frontend not-found page", async () => {
    const res = await app.request("/definitely-not-a-real-code");
    expect(res.status).toBe(StatusCodes.MOVED_TEMPORARILY);
    expect(res.headers.get("location")).toContain(
      "/link-not-found?code=definitely-not-a-real-code",
    );
  });
});

describe("gET /api/:code/stats", () => {
  it("returns the click count for a link", async () => {
    const created = await (await createLink("https://stats.test/")).json();
    await app.request(`/${created.short_code}`);
    await app.request(`/${created.short_code}`);
    const res = await authed(`/api/${created.short_code}/stats`);
    expect(res.status).toBe(StatusCodes.OK);
    const body = await res.json();
    expect(body.original_url).toBe("https://stats.test/");
    expect(Array.isArray(body.clicks)).toBe(true);
    expect(body.clicks).toHaveLength(2);
  });
});

describe("authentication", () => {
  it("rejects /links without a session", async () => {
    const res = await app.request("/api/links");
    expect(res.status).toBe(StatusCodes.UNAUTHORIZED);
  });

  it("rejects link creation without a session", async () => {
    const res = await app.request("/api/links", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ original_url: "https://unauth.test/" }),
    });
    expect(res.status).toBe(StatusCodes.UNAUTHORIZED);
  });

  it("scopes the link list to the signed-in user", async () => {
    const res = await authed("/api/links");
    expect(res.status).toBe(StatusCodes.OK);
    for (const link of await res.json()) {
      expect(typeof link.user_id).toBe("string");
    }
  });
});

describe("anonymous (guest) accounts", () => {
  async function guestCookie() {
    const res = await auth.api.signInAnonymous({ asResponse: true });
    const setCookie = res.headers.get("set-cookie");
    if (!setCookie) throw new Error("anonymous sign-in returned no cookie");
    return setCookie.split(";")[0];
  }

  function asGuest(jar: string, path: string, init: RequestInit = {}) {
    return app.request(path, {
      ...init,
      headers: { cookie: jar, ...(init.headers ?? {}) },
    });
  }

  function createGuestLink(jar: string, original_url: string) {
    return asGuest(jar, "/api/links", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ original_url }),
    });
  }

  it("allows two links, then rejects a third", async () => {
    const jar = await guestCookie();
    expect(
      (await createGuestLink(jar, "https://guest-a.test/")).status,
    ).toBe(StatusCodes.CREATED);
    expect(
      (await createGuestLink(jar, "https://guest-b.test/")).status,
    ).toBe(StatusCodes.CREATED);
    const third = await createGuestLink(jar, "https://guest-c.test/");
    expect(third.status).toBe(StatusCodes.FORBIDDEN);
  });

  it("blocks stats, edits, and deletes", async () => {
    const jar = await guestCookie();
    const created = await (
      await createGuestLink(jar, "https://guest-manage.test/")
    ).json();

    const stats = await asGuest(jar, `/api/${created.short_code}/stats`);
    expect(stats.status).toBe(StatusCodes.FORBIDDEN);

    const patch = await asGuest(jar, `/api/links/${created.short_code}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ link_text: "guest-edit" }),
    });
    expect(patch.status).toBe(StatusCodes.FORBIDDEN);

    const del = await asGuest(jar, `/api/links/${created.short_code}`, {
      method: "DELETE",
    });
    expect(del.status).toBe(StatusCodes.FORBIDDEN);
  });

  it("moves guest links into the account on sign-up", async () => {
    const jar = await guestCookie();
    const created = await (
      await createGuestLink(jar, "https://guest-claim.test/")
    ).json();

    const signUp = await app.request("/api/auth/sign-up/email", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        cookie: jar,
        origin: process.env.FRONTEND_URL ?? "http://localhost:5173",
      },
      body: JSON.stringify({
        email: `guest-up-${crypto.randomUUID()}@test.local`,
        password: "Str0ngPassw0rd!",
        name: "Guest Up",
      }),
    });
    expect(signUp.status).toBe(StatusCodes.OK);

    const setCookie = signUp.headers.get("set-cookie");
    if (!setCookie) throw new Error("sign-up did not return a session cookie");
    const accountCookie = setCookie.split(";")[0];

    const list = await asGuest(accountCookie, "/api/links");
    expect(list.status).toBe(StatusCodes.OK);
    const links = await list.json();
    expect(links.map((link: { id: number }) => link.id)).toContain(created.id);

    const oldSession = await asGuest(jar, "/api/auth/get-session");
    expect(await oldSession.json()).toBeNull();
  });
});

describe("dELETE /api/links/:code", () => {
  it("deletes a link and its code stops resolving", async () => {
    const created = await (await createLink("https://del.test/")).json();
    const del = await authed(`/api/links/${created.short_code}`, {
      method: "DELETE",
    });
    expect(del.status).toBe(StatusCodes.NO_CONTENT);
    const after = await app.request(`/${created.short_code}`);
    expect(after.status).toBe(StatusCodes.MOVED_TEMPORARILY);
    expect(after.headers.get("location")).toContain("/link-not-found");
  });

  it('returns "not found" when deleting an unknown code', async () => {
    const res = await authed("/api/links/unknown-code", { method: "DELETE" });
    expect(res.status).toBe(StatusCodes.NOT_FOUND);
  });
});
