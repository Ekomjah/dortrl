// middleware/rate-limit.middleware.ts
import { env } from "cloudflare:workers";
import type { MiddlewareHandler } from "hono";
import { StatusCodes } from "shared";
import { getConnInfo } from "hono/cloudflare-workers";
import type { HonoEnv } from "@/lib/types.js";

// Cloudflare's Rate Limiting binding is an edge pass/fail gate: it reports
// `success` but keeps no hit count, so it cannot back a counter-style store.
// The count is also approximate per-colo rather than globally exact.
export const createLinkLimiter = (): MiddlewareHandler<HonoEnv> => {
  return async (c, next) => {
    const key =
      c.req.header("cf-connecting-ip") ??
      c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ??
      getConnInfo(c).remote.address ??
      "unknown";

    const { success } = await env.LINK_RATE_LIMITER.limit({ key });

    if (!success) {
      return c.json(
        { message: "Too many link creations. Try again later." },
        StatusCodes.TOO_MANY_REQUESTS,
      );
    }

    await next();
  };
};