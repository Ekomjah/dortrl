import { cors } from "hono/cors";
import { Hono } from "hono";
import { ReasonPhrases, StatusCodes } from "shared";
import { ConflictError } from "./lib/errors";
import { requestLogger } from "./middleware/logger";
import linksRoute from "./routes/links/links.routes";
import { linksRepository } from "./routes/links/links.service";
import { healthRoute, statsRoute } from "./routes/stats/stats.routes";
import { statsService } from "./routes/stats/stats.service";
import { auth } from "./lib/auth";
import { runLinkCleanup } from "./jobs/link-cleanup";

const app = new Hono({ strict: false });
app.use(cors({ origin: process.env.FRONTEND_URL!, credentials: true }));
app.use(requestLogger());
app.notFound((c) =>
  c.json({ message: ReasonPhrases.NOT_FOUND }, StatusCodes.NOT_FOUND),
);
app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw));
app.onError((err, c) => {
  console.error(err);
  if (err instanceof ConflictError) {
    return c.json({ message: err.message }, err.status);
  }
  return c.json(
    { message: ReasonPhrases.INTERNAL_SERVER_ERROR },
    StatusCodes.INTERNAL_SERVER_ERROR,
  );
});

app.get("/", (c) => {
  return c.json({ id: 1, text: "Hello Hono!" });
});
app.get("/favicon.ico", (c) => c.body(null, 204));
app.route("/", healthRoute);
app.route("/api/links", linksRoute);
app.route("/api", statsRoute);

app.get("/:code", async (c) => {
  const { code } = c.req.param();
  const link = await linksRepository.getLink(code);

  if (!link) {
    return c.redirect(
      `${process.env.FRONTEND_URL}/link-not-found?code=${encodeURIComponent(code)}`,
      StatusCodes.MOVED_TEMPORARILY,
    );
  }

  const click = statsService
    .updateClicks(link.id, {
      referrer: c.req.header("referer"),
      userAgent: c.req.header("user-agent"),
      ipAddress: c.req.header("x-forwarded-for"),
    })
    .catch((err) => console.error("Failed to record click:", err));

  try {
    c.executionCtx.waitUntil(click);
  } catch {
    await click;
  }

  return c.redirect(link.original_url, StatusCodes.MOVED_TEMPORARILY);
});
export { app };
export default {
  fetch: app.fetch,
  scheduled: async () => {
    await runLinkCleanup();
  },
};
