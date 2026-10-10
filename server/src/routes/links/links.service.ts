import type { InsertLink, NewLink, SelectLink } from "../../db/schema.js";
import { db } from "../../db/client.js";
import { links } from "../../db/schema.js";
import { ConflictError } from "../../lib/errors.js";
import {
  and,
  eq,
  ne,
  or,
} from "drizzle-orm/sql/expressions/conditions";
import { count, desc } from "drizzle-orm";
import { generateId } from "shared";

// `link_text` and `short_code` share one flat namespace because the public
// redirect is a single catch-all segment, so neither may shadow the other.
// Reserved values are those already claimed by a top-level route registered
// ahead of the catch-all; `api` is listed defensively even though its length
// keeps it unreachable today.
const RESERVED_TEXT = new Set(["health", "links", "api", "stats"]);

const normalizeText = (value?: string | null) =>
  value ? value.trim() : null;

const assertReserved = (text: string | null) => {
  if (text && RESERVED_TEXT.has(text)) {
    throw new ConflictError(`"${text}" is reserved`);
  }
};

// Claims `identifier` if any other row already uses it as a short_code or a
// link_text. `excludeCode` skips the row being updated so a no-op save works.
const assertAvailable = async (identifier: string, excludeCode?: string) => {
  const taken = await db
    .select({ id: links.id })
    .from(links)
    .where(
      and(
        excludeCode ? ne(links.short_code, excludeCode) : undefined,
        or(eq(links.short_code, identifier), eq(links.link_text, identifier)),
      ),
    )
    .get();

  if (taken) {
    throw new ConflictError(`"${identifier}" is already taken`);
  }
};

export const linksRepository = {
  createNewLink: async (
    input: InsertLink,
    userId: string,
  ): Promise<NewLink> => {
    const short_code = input.short_code || generateId(15);
    const link_text = normalizeText(input.link_text);

    assertReserved(link_text);
    await assertAvailable(short_code);
    if (link_text) {
      await assertAvailable(link_text);
    }

    const hasExistingOriginalUrl = await db.query.links.findFirst({
      where: { original_url: input.original_url },
    });
    if (hasExistingOriginalUrl) {
      throw new ConflictError("Original URL already exists");
    }

    const link = await db
      .insert(links)
      .values({ ...input, short_code, link_text, user_id: userId })
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
  getLink: async (identifier: string): Promise<SelectLink | undefined> => {
    const link = await db
      .select()
      .from(links)
      .where(
        or(eq(links.short_code, identifier), eq(links.link_text, identifier)),
      )
      .get();
    return link;
  },
  updateLink: async (
    code: string,
    input: Partial<InsertLink>,
    userId: string,
  ): Promise<SelectLink | undefined> => {
    if (input.link_text !== undefined) {
      const link_text = normalizeText(input.link_text);
      assertReserved(link_text);
      if (link_text) {
        await assertAvailable(link_text, code);
      }
      input = { ...input, link_text };
    }
    if (input.short_code) {
      await assertAvailable(input.short_code, code);
    }

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
