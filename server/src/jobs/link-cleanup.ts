import { linksRepository } from "@/routes/links/links.service";

export async function runLinkCleanup(): Promise<number> {
  const removed = linksRepository.deleteExpiredLinks();
  console.log("Purging the Database for Expired Links (cron)");
  return removed;
}
