// middleware/rate-limit.middleware.ts
import { rateLimiter } from "hono-rate-limiter";
import { getConnInfo } from "hono/bun";
import type { HonoEnv } from "@/lib/types.js";

// Tests share one IP, so a per-IP budget would fail the suite. setup.ts sets
// APP_ENV=test before the app is imported.
const isTest = process.env.APP_ENV === "test";

export const createLinkLimiter = rateLimiter<HonoEnv>({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: isTest ? 100_000 : 10, // attempts per IP per hour
  standardHeaders: "draft-6",
  message: { message: "Too many link creations. Try again later." },
  keyGenerator: (c) =>
    c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ??
    getConnInfo(c).remote.address ??
    "unknown",
});
