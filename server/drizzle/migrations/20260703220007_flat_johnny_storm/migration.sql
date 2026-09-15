CREATE TABLE `clicks` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`link_id` integer NOT NULL,
	`clicked_at` integer DEFAULT (unixepoch()) NOT NULL,
	`referrer` text,
	`user_agent` text,
	`ip_address` text,
	CONSTRAINT `fk_clicks_link_id_links_id_fk` FOREIGN KEY (`link_id`) REFERENCES `links`(`id`)
);
--> statement-breakpoint
CREATE TABLE `links` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`short_code` text UNIQUE,
	`original_url` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`expires_at` integer DEFAULT (unixepoch('now', '+5 days'))
);
