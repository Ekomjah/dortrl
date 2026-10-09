PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_clicks` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`link_id` integer NOT NULL,
	`clicked_at` integer DEFAULT (unixepoch()) NOT NULL,
	`referrer` text,
	`user_agent` text,
	`ip_address` text,
	CONSTRAINT `fk_clicks_link_id_links_id_fk` FOREIGN KEY (`link_id`) REFERENCES `links`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
INSERT INTO `__new_clicks`(`id`, `link_id`, `clicked_at`, `referrer`, `user_agent`, `ip_address`) SELECT `id`, `link_id`, `clicked_at`, `referrer`, `user_agent`, `ip_address` FROM `clicks`;--> statement-breakpoint
DROP TABLE `clicks`;--> statement-breakpoint
ALTER TABLE `__new_clicks` RENAME TO `clicks`;--> statement-breakpoint
PRAGMA foreign_keys=ON;