CREATE TABLE `short_urls` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(6) NOT NULL,
	`data` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `short_urls_id` PRIMARY KEY(`id`),
	CONSTRAINT `short_urls_code_unique` UNIQUE(`code`)
);
