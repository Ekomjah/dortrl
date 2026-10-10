import { createMiddleware } from "hono/factory";
import { auth } from "@/lib/auth.js";
import type { HonoEnv } from "@/lib/types.js";
import { linksRepository } from "@/routes/links/links.service.js"; // adjust path

const ANON_LINK_LIMIT = 2;

// Runs on everything: attaches user or null, never blocks
export const optionalAuth = createMiddleware<HonoEnv>(async (c, next) => {
  const data = await auth.api.getSession({ headers: c.req.raw.headers });
  if (data?.user) {
    c.set("user", data.user);
  }
  if (data?.session) {
    c.set("session", data.session);
  }
  await next();
});

export const requireUser = createMiddleware<HonoEnv>(async (c, next) => {
  if (!c.get("user")) return c.json({ message: "Unauthorized" }, 401);
  await next();
});

export const requireFullAccount = createMiddleware<HonoEnv>(async (c, next) => {
  const user = c.get("user");
  if (!user) return c.json({ message: "Unauthorized" }, 401);
  if (user.isAnonymous) {
    return c.json({ message: "Sign up to use this feature" }, 403);
  }
  await next();
});

export const enforceLinkLimit = createMiddleware<HonoEnv>(async (c, next) => {
  const user = c.get("user");
  if (!user) return c.json({ message: "Unauthorized" }, 401);
  if (user.isAnonymous) {
    const total = await linksRepository.countByUserId(user.id);
    if (total >= ANON_LINK_LIMIT) {
      return c.json(
        {
          message: "Anonymous limit reached (2 links). Sign up to create more.",
        },
        403,
      );
    }
  }
  await next();
});
