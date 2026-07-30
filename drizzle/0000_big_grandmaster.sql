CREATE TABLE `activity` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`request_id` text NOT NULL,
	`author` text NOT NULL,
	`action` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `automation_rules` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`trigger` text NOT NULL,
	`action` text NOT NULL,
	`owner` text NOT NULL,
	`owner_initials` text NOT NULL,
	`owner_color` text NOT NULL,
	`status` text NOT NULL,
	`category` text NOT NULL,
	`runs_this_week` integer NOT NULL,
	`last_run` text NOT NULL,
	`impact` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `requests` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`category` text NOT NULL,
	`requester_name` text NOT NULL,
	`requester_email` text,
	`requester_initials` text NOT NULL,
	`assignee_name` text NOT NULL,
	`assignee_initials` text NOT NULL,
	`status` text NOT NULL,
	`priority` text NOT NULL,
	`description` text NOT NULL,
	`due` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
