import { drizzle } from "drizzle-orm/libsql";
import { seed } from "drizzle-seed";
import * as schema from "../schema";
import "dotenv/config";

const seedLinks = [
  {
    original_url: "https://example.com",
  },
  {
    original_url: "https://jw.org",
  },
  {
    original_url: "https://www.google.com",
  },
];

const clickBatches = [
  [
    {
      referrer: "https://news.ycombinator.com",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/126.0",
      ipAddress: "203.0.113.10",
    },
    {
      referrer: "https://www.reddit.com",
      userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X)",
      ipAddress: "198.51.100.24",
    },
  ],
  [
    {
      referrer: null,
      userAgent: "curl/8.5.0",
      ipAddress: "192.0.2.99",
    },
    {
      referrer: "https://www.google.com",
      userAgent:
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15",
      ipAddress: "203.0.113.55",
    },
  ],
];

async function seedDatabase() {
  const db = drizzle(process.env.DB_FILE_NAME as string);
  await db.delete(schema.clicks); // removes ALL rows from clicks
  await db.delete(schema.links); // removes ALL rows from links

  const insertedLinks = await db
    .insert(schema.links)
    .values(seedLinks)
    .returning();

  for (let i = 0; i < clickBatches.length; i++) {
    const link = insertedLinks[i];
    const batch = clickBatches[i];
    if (!batch || !link) continue;
    await db.insert(schema.clicks).values(
      batch.map((click) => ({
        link_id: link.id,
        referrer: click.referrer,
        user_agent: click.userAgent,
        ip_address: click.ipAddress,
      })),
    );
  }

  console.log("Database seeded successfully");
}

seedDatabase().catch((error) => {
  console.error("Error seeding database:", error);
  process.exit(1);
});
