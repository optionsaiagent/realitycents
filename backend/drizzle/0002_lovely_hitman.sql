CREATE TABLE `toolkit_agents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`brokerage` varchar(255) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `toolkit_agents_id` PRIMARY KEY(`id`),
	CONSTRAINT `toolkit_agents_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `toolkit_downloads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`agentId` int NOT NULL,
	`resourceId` int NOT NULL,
	`downloadedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `toolkit_downloads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `toolkit_resources` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`category` enum('buyer_handouts','agent_scripts','local_checklists') NOT NULL,
	`fileUrl` text NOT NULL,
	`downloadCount` int NOT NULL DEFAULT 0,
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `toolkit_resources_id` PRIMARY KEY(`id`)
);
