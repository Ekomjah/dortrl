import { Hono } from "hono";
import { ReasonPhrases, StatusCodes } from "shared";
import { linkValidators } from "./links.schema.js";
import type { HonoEnv } from "@/lib/types.js";
import { linksRepository } from "./links.service.js";
import {
  optionalAuth,
  requireUser,
  requireFullAccount,
  enforceLinkLimit,
} from "@/middleware/auth.middleware.js";

const linksRoute = new Hono<HonoEnv>()
  .use(optionalAuth)
  .get("/", requireUser, async (c) => {
    const user = c.get("user");
    try {
      const allLinks = await linksRepository.getLinksByUserId(user.id);
      return c.json(allLinks);
    } catch (error) {
      console.error("Error fetching links", error);
      return c.json({ error: "Failed to fetch links" }, 500);
    }
  })
  .post("/", enforceLinkLimit, ...linkValidators.create(), async (c) => {
    const user = c.get("user");
    const itemsToSave = c.req.valid("json");
    const inserted = await linksRepository.createNewLink(itemsToSave, user.id);
    return c.json(inserted, StatusCodes.CREATED);
  })
  .patch(
    "/:code",
    requireFullAccount,
    ...linkValidators.update(),
    async (c) => {
      const user = c.get("user");
      const { code } = c.req.valid("param");
      const itemsToUpdate = c.req.valid("json");
      const updated = await linksRepository.updateLink(
        code,
        itemsToUpdate,
        user.id,
      );
      if (!updated) {
        return c.json(
          { message: ReasonPhrases.NOT_FOUND },
          StatusCodes.NOT_FOUND,
        );
      }
      return c.json(updated);
    },
  )
  .delete(
    "/:code",
    requireFullAccount,
    ...linkValidators.getById(),
    async (c) => {
      const { code } = c.req.valid("param");
      const user = c.get("user")!;
      const deleted = await linksRepository.deleteLink(code, user.id);
      if (!deleted) {
        return c.json(
          { message: ReasonPhrases.NOT_FOUND },
          StatusCodes.NOT_FOUND,
        );
      }

      return c.body(null, StatusCodes.NO_CONTENT);
    },
  );

export default linksRoute;
