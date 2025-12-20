CREATE TABLE `chapter` (
	`id` text PRIMARY KEY NOT NULL,
	`chapter_number` integer NOT NULL,
	`title` text NOT NULL,
	`content` text NOT NULL,
	`answer` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`escape_room_id` text NOT NULL,
	FOREIGN KEY (`escape_room_id`) REFERENCES `escape_room`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `chapter_escapeRoomId_idx` ON `chapter` (`escape_room_id`);--> statement-breakpoint
CREATE TABLE `escape_room` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`user_id` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `escape_room_userId_idx` ON `escape_room` (`user_id`);--> statement-breakpoint
CREATE TABLE `hint` (
	`id` text PRIMARY KEY NOT NULL,
	`hint_number` integer NOT NULL,
	`content` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`chapter_id` text NOT NULL,
	FOREIGN KEY (`chapter_id`) REFERENCES `chapter`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `hint_chapterId_idx` ON `hint` (`chapter_id`);