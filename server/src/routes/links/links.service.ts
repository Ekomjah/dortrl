import type { InsertLink, NewLink, SelectLink } from "../../db/schema.js";
import { db } from "../../db/client.js";
import { links } from "../../db/schema.js";
import { and, eq } from "drizzle-orm/sql/expressions/conditions";
import { count, desc } from "drizzle-orm";
import { generateId } from "shared";

export const linksRepository = {
  createNewLink: async (
    input: InsertLink,
    userId: string,
  ): Promise<NewLink> => {
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
      .values({ ...input, short_code, user_id: userId })
      .returning()
      .get();
    return link;
  },
  getLinksByUserId: async (userId: string): Promise<SelectLink[]> => {
    const userLinks = await db
      .select()
      .from(links)
      .where(eq(links.user_id, userId))
      .orderBy(desc(links.created_at));
    return userLinks;
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
    userId: string,
  ): Promise<SelectLink | undefined> => {
    const link = await db
      .update(links)
      .set(input)
      .where(and(eq(links.short_code, code), eq(links.user_id, userId)))
      .returning()
      .get();
    return link;
  },
  deleteLink: async (
    code: string,
    userId: string,
  ): Promise<SelectLink | undefined> => {
    return await db
      .delete(links)
      .where(and(eq(links.short_code, code), eq(links.user_id, userId)))
      .returning()
      .get();
  },
  countByUserId: async (userId: string) => {
    const [row] = await db
      .select({ n: count() })
      .from(links)
      .where(eq(links.user_id, userId));
    return row?.n ?? 0;
  },
};
