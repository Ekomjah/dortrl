import { Hono } from "hono";
import { StatusCodes } from "shared";
import type { HonoEnv } from "@/lib/types.js";
import { statsService } from "./stats.service.js";
import { optionalAuth } from "@/middleware/auth.middleware.js";

const statsRoute = new Hono<HonoEnv>()
  .use(optionalAuth)
  .get("/health", async (c) => {
    const health = await statsService.healthCheck();
    const status =
      health.status === "ok" ? StatusCodes.OK : StatusCodes.SERVICE_UNAVAILABLE;

    return c.json(health, status);
  })
  .get("/:code/stats", async (c) => {
    const { code } = c.req.param();
    const link = await statsService.clicksStats(code);

    if (!link) {
      return c.json({ message: "Link not found" }, StatusCodes.NOT_FOUND);
    }

    return c.json(link);
  });
export default statsRoute;
