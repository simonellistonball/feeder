ALTER TABLE "workers_gmail_message_response" ADD CONSTRAINT "workers_gmail_message_response_message_id_unique" UNIQUE("message_id");

CREATE TABLE "workers_gmail_attachment" (
	"id" uuid PRIMARY KEY NOT NULL,
	"message_id" varchar(255) NOT NULL,
	"attachment_id" varchar(255) NOT NULL,
	"filename" varchar(255) NOT NULL,
	"mime_type" varchar(255) NOT NULL,
	"stored_at" varchar(255) NOT NULL,
	"size" integer NOT NULL,
	"fetched_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "workers_gmail_message_response" ALTER COLUMN "message_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "workers_gmail_attachment" ADD CONSTRAINT "workers_gmail_attachment_message_id_workers_gmail_message_response_message_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."workers_gmail_message_response"("message_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
