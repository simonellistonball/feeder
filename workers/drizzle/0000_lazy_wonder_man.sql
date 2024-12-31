CREATE TABLE "workers_gmail_list_response" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_id" varchar(255) NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"response" json NOT NULL,
	"fetched_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workers_gmail_message_response" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_id" varchar(255) NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"message_id" varchar(255),
	"payload" text,
	"snippet" text,
	"history_id" varchar(255),
	"internal_date" bigint,
	"size_estimate" integer,
	"raw" text,
	"fetched_at" timestamp DEFAULT now() NOT NULL
);
