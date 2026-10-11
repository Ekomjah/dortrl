import { env } from "cloudflare:workers";
import { drizzle } from "drizzle-orm/d1";
import { dbRelations as relations } from "./relations.js";

export const db = drizzle(env.DB, { relations, logger: true });
