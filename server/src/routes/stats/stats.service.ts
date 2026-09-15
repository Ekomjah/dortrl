import type { statsClicks } from "./stats.schema.js";
import { db } from "../../db/client.js";
import { clicks, links } from "../../db/schema.js";

type HealthState = "ok" | "error";

export interface HealthCheck {
  status: HealthState;
  timestamp: string;
  database: {
    status: HealthState;
    latencyMs: number;
    error?: string;
  };
}

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message;
  }

  return "Unknown database error";
};

export const statsService = {
  healthCheck: async (): Promise<HealthCheck> => {
    const startedAt = Date.now();

    try {
      await db.select({ id: links.id }).from(links).limit(1).all();

      return {
        status: "ok",
        timestamp: new Date().toISOString(),
        database: {
          status: "ok",
          latencyMs: Date.now() - startedAt,
        },
      };
    } catch (error) {
      return {
        status: "error",
        timestamp: new Date().toISOString(),
        database: {
          status: "error",
          latencyMs: Date.now() - startedAt,
          error: getErrorMessage(error),
        },
      };
    }
  },

  clicksStats: async (code: string): Promise<statsClicks | undefined> => {
    const link = await db.query.links.findFirst({
      where: { short_code: code },
      with: {
        clicks: true,
      },
    });

    return link;
  },
  updateClicks: async (
    linkId: number,
    meta?: { referrer?: string; userAgent?: string; ipAddress?: string },
  ): Promise<void> => {
    await db.insert(clicks).values({
      link_id: linkId,
      referrer: meta?.referrer,
      user_agent: meta?.userAgent,
      ip_address: meta?.ipAddress,
    });
    //eslint-disable-next-line no-console
    console.log("Added successfully click for linkId:", linkId);
  },
};

export const healthCheck = statsService.healthCheck;
