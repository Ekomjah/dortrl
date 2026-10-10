// middleware/rate-limit.middleware.ts
import { rateLimiter } from "hono-rate-limiter";
import { getConnInfo } from "hono/bun";
import type { HonoEnv } from "@/lib/types.js";

export const createLinkLimiter = rateLimiter<HonoEnv>({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 10, // attempts per IP per hour
  standardHeaders: "draft-6",
  message: { message: "Too many link creations. Try again later." },
  keyGenerator: (c) =>
    c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ??
    getConnInfo(c).remote.address ??
    "unknown",
});
