ALTER TABLE `links` ADD `link_text` text;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_links` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`user_id` text NOT NULL,
	`link_text` text,
	`short_code` text NOT NULL UNIQUE,
	`original_url` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`expires_at` integer DEFAULT (unixepoch('now', '+5 days')) NOT NULL,
	CONSTRAINT `fk_links_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE,
	CONSTRAINT "link_text_length" CHECK(link_text is null OR (length(link_text) >= 5 AND length(link_text) <= 15)),
	CONSTRAINT "short_code_length" CHECK(length("short_code") >= 5 AND length("short_code") <= 15)
);
--> statement-breakpoint
INSERT INTO `__new_links`(`id`, `user_id`, `short_code`, `original_url`, `created_at`, `expires_at`) SELECT `id`, `user_id`, `short_code`, `original_url`, `created_at`, `expires_at` FROM `links`;--> statement-breakpoint
DROP TABLE `links`;--> statement-breakpoint
ALTER TABLE `__new_links` RENAME TO `links`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `original_url_idx` ON `links` (`original_url`);--> statement-breakpoint
CREATE UNIQUE INDEX `links_link_text_uidx` ON `links` (`link_text`);