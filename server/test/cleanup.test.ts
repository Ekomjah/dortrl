import { env } from "cloudflare:workers";
import {
  createExecutionContext,
  createScheduledController,
  waitOnExecutionContext,
} from "cloudflare:test";
import { describe, expect, it } from "vitest";
import worker from "../src/index.js";
import { db } from "../src/db/client.js";
import { links } from "../src/db/schema.js";
import { user } from "../src/db/auth-schema.js";

const DAY = 86_400_000;

// `insertLinkSchema` refuses a past `expires_at` ("Must be a future date"), so
// the only way to age a link past its expiry is to write it directly.
async function seedUser() {
  const [existing] = await db.select({ id: user.id }).from(user).limit(1);
  if (existing) return existing.id;

  const id = crypto.randomUUID();
  await db.insert(user).values({ id, name: "Cleanup", email: `${id}@test.local` });
  return id;
}

async function seedLink(
  userId: string,
  originalUrl: string,
  expiresAt: Date | null,
) {
  const [row] = await db
    .insert(links)
    .values({
      user_id: userId,
      original_url: originalUrl,
      short_code: `${crypto.randomUUID().slice(0, 10)}`,
      expires_at: expiresAt,
    })
    .returning({ id: links.id, short_code: links.short_code });
  return row;
}

describe("scheduled link cleanup", () => {
  it("removes expired links and leaves the rest alone", async () => {
    const userId = await seedUser();

    const expired = await seedLink(
      userId,
      "https://expired-cleanup.test/",
      new Date(Date.now() - DAY),
    );
    const live = await seedLink(
      userId,
      "https://live-cleanup.test/",
      new Date(Date.now() + DAY),
    );
    const noExpiry = await seedLink(
      userId,
      "https://no-expiry-cleanup.test/",
      null,
    );

    const ctx = createExecutionContext();
    await worker.scheduled(createScheduledController(), env, ctx);
    await waitOnExecutionContext(ctx);

    const surviving = new Set(
      (await db.select({ id: links.id }).from(links)).map((r) => r.id),
    );

    expect(surviving.has(expired.id)).toBe(false);
    expect(surviving.has(live.id)).toBe(true);
    expect(surviving.has(noExpiry.id)).toBe(true);
  });

  it("is idempotent across repeated runs", async () => {
    const userId = await seedUser();
    await seedLink(userId, "https://twice-cleanup.test/", new Date(Date.now() - DAY));

    const first = createExecutionContext();
    await worker.scheduled(createScheduledController(), env, first);
    await waitOnExecutionContext(first);

    const second = createExecutionContext();
    await worker.scheduled(createScheduledController(), env, second);
    await waitOnExecutionContext(second);

    const remaining = await db.select({ id: links.id }).from(links);
    expect(remaining).toHaveLength(0);
  });
});