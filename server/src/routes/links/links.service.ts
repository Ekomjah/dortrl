import type { InsertLink, NewLink, SelectLink } from "../../db/schema.js";
import { db } from "../../db/client.js";
import { links } from "../../db/schema.js";
import { eq } from "drizzle-orm/sql/expressions/conditions";
import { generateId } from "shared";

export const linksRepository = {
  createNewLink: async (input: InsertLink): Promise<NewLink> => {
    const short_code = input.short_code || generateId(15);
    const hasExistingShortCode = await db.query.links.findFirst({
      where: { short_code },
    });
    const hasExistingOriginalUrl = await db.query.links.findFirst({
      where: { original_url: input.original_url },
    });

    if (hasExistingShortCode) {
      throw new Error("Short code already exists");
    }
    if (hasExistingOriginalUrl) {
      throw new Error("Original URL already exists");
    }
    const link = await db
      .insert(links)
      .values({ ...input, short_code })
      .returning()
      .get();
    return link;
  },
  getAllLinks: async (): Promise<SelectLink[]> => {
    const allLinks = await db.select().from(links).all();
    return allLinks;
  },
  getLink: async (code: string): Promise<SelectLink | undefined> => {
    const link = await db.query.links.findFirst({
      where: { short_code: code },
    });
    return link;
  },
  updateLink: async (
    code: string,
    input: Partial<InsertLink>,
  ): Promise<SelectLink | undefined> => {
    const link = await db
      .update(links)
      .set(input)
      .where(eq(links.short_code, code))
      .returning()
      .get();
    return link;
  },
  deleteLink: async (code: string): Promise<SelectLink | undefined> => {
    return await db
      .delete(links)
      .where(eq(links.short_code, code))
      .returning()
      .get();
  },
};
