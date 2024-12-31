CREATE TABLE "workers_gdocs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"document_id" varchar(255) NOT NULL,
	"text" text,
	"response" json NOT NULL,
	"fetched_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workers_gdrive_files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"document_id" varchar(255) NOT NULL,
	"text_file" varchar,
	"raw_file" varchar,
	"mime_type" varchar(255),
	"fetched_at" timestamp DEFAULT now() NOT NULL
);
