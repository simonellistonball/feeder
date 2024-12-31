CREATE TYPE "public"."importance" AS ENUM('low', 'medium', 'high', 'critical');--> statement-breakpoint
CREATE TYPE "public"."rag" AS ENUM('red', 'amber', 'green');--> statement-breakpoint
CREATE TYPE "public"."status" AS ENUM('todo', 'in_progress', 'done');--> statement-breakpoint
CREATE TABLE "feedgraph_checklist_items_template" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"checklist_template_id" uuid NOT NULL,
	"text" text NOT NULL,
	"importance" "importance" NOT NULL,
	"rag" "rag",
	"status" "status" DEFAULT 'todo' NOT NULL,
	"notes" text,
	"path_to_green" text,
	"created_by_id" uuid NOT NULL,
	"updated_by_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"data_source_id" uuid
);
--> statement-breakpoint
CREATE TABLE "feedgraph_checklist_template" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_by_id" uuid NOT NULL,
	"updated_by_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"data_source_id" uuid
);
--> statement-breakpoint
CREATE TABLE "feedgraph_checklist" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"product_id" uuid,
	"release_id" uuid,
	"feedback_id" uuid,
	"created_by_id" uuid NOT NULL,
	"updated_by_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"data_source_id" uuid
);
--> statement-breakpoint
CREATE TABLE "feedgraph_checklist_item" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_by_id" uuid NOT NULL,
	"updated_by_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"data_source_id" uuid,
	"checklist_id" uuid NOT NULL,
	"product_id" uuid,
	"release_id" uuid,
	"feedback_id" uuid,
	"text" text NOT NULL,
	"importance" "importance",
	"rag" "rag",
	"status" "status" DEFAULT 'todo' NOT NULL,
	"notes" text,
	"path_to_green" text,
	"completed" timestamp
);
--> statement-breakpoint
CREATE TABLE "feedgraph_checklist_item_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"checklist_item_id" uuid NOT NULL,
	"status" "status" NOT NULL,
	"notes" text,
	"rag" "rag",
	"path_to_green" text,
	"log_date" timestamp DEFAULT now() NOT NULL,
	"created_by_id" uuid NOT NULL,
	"updated_by_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"data_source_id" uuid
);
--> statement-breakpoint
ALTER TABLE "feedgraph_checklist_items_template" ADD CONSTRAINT "feedgraph_checklist_items_template_checklist_template_id_feedgraph_checklist_template_id_fk" FOREIGN KEY ("checklist_template_id") REFERENCES "public"."feedgraph_checklist_template"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_checklist_items_template" ADD CONSTRAINT "feedgraph_checklist_items_template_created_by_id_feedgraph_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."feedgraph_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_checklist_items_template" ADD CONSTRAINT "feedgraph_checklist_items_template_updated_by_id_feedgraph_user_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."feedgraph_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_checklist_items_template" ADD CONSTRAINT "feedgraph_checklist_items_template_data_source_id_feedgraph_data_sources_id_fk" FOREIGN KEY ("data_source_id") REFERENCES "public"."feedgraph_data_sources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_checklist_template" ADD CONSTRAINT "feedgraph_checklist_template_created_by_id_feedgraph_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."feedgraph_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_checklist_template" ADD CONSTRAINT "feedgraph_checklist_template_updated_by_id_feedgraph_user_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."feedgraph_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_checklist_template" ADD CONSTRAINT "feedgraph_checklist_template_data_source_id_feedgraph_data_sources_id_fk" FOREIGN KEY ("data_source_id") REFERENCES "public"."feedgraph_data_sources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_checklist" ADD CONSTRAINT "feedgraph_checklist_product_id_feedgraph_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."feedgraph_products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_checklist" ADD CONSTRAINT "feedgraph_checklist_release_id_feedgraph_releases_id_fk" FOREIGN KEY ("release_id") REFERENCES "public"."feedgraph_releases"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_checklist" ADD CONSTRAINT "feedgraph_checklist_feedback_id_feedgraph_feedback_id_fk" FOREIGN KEY ("feedback_id") REFERENCES "public"."feedgraph_feedback"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_checklist" ADD CONSTRAINT "feedgraph_checklist_created_by_id_feedgraph_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."feedgraph_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_checklist" ADD CONSTRAINT "feedgraph_checklist_updated_by_id_feedgraph_user_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."feedgraph_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_checklist" ADD CONSTRAINT "feedgraph_checklist_data_source_id_feedgraph_data_sources_id_fk" FOREIGN KEY ("data_source_id") REFERENCES "public"."feedgraph_data_sources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_checklist_item" ADD CONSTRAINT "feedgraph_checklist_item_created_by_id_feedgraph_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."feedgraph_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_checklist_item" ADD CONSTRAINT "feedgraph_checklist_item_updated_by_id_feedgraph_user_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."feedgraph_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_checklist_item" ADD CONSTRAINT "feedgraph_checklist_item_data_source_id_feedgraph_data_sources_id_fk" FOREIGN KEY ("data_source_id") REFERENCES "public"."feedgraph_data_sources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_checklist_item" ADD CONSTRAINT "feedgraph_checklist_item_checklist_id_feedgraph_checklist_id_fk" FOREIGN KEY ("checklist_id") REFERENCES "public"."feedgraph_checklist"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_checklist_item" ADD CONSTRAINT "feedgraph_checklist_item_product_id_feedgraph_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."feedgraph_products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_checklist_item" ADD CONSTRAINT "feedgraph_checklist_item_release_id_feedgraph_releases_id_fk" FOREIGN KEY ("release_id") REFERENCES "public"."feedgraph_releases"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_checklist_item" ADD CONSTRAINT "feedgraph_checklist_item_feedback_id_feedgraph_feedback_id_fk" FOREIGN KEY ("feedback_id") REFERENCES "public"."feedgraph_feedback"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_checklist_item_log" ADD CONSTRAINT "feedgraph_checklist_item_log_checklist_item_id_feedgraph_checklist_item_id_fk" FOREIGN KEY ("checklist_item_id") REFERENCES "public"."feedgraph_checklist_item"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_checklist_item_log" ADD CONSTRAINT "feedgraph_checklist_item_log_created_by_id_feedgraph_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."feedgraph_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_checklist_item_log" ADD CONSTRAINT "feedgraph_checklist_item_log_updated_by_id_feedgraph_user_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."feedgraph_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_checklist_item_log" ADD CONSTRAINT "feedgraph_checklist_item_log_data_source_id_feedgraph_data_sources_id_fk" FOREIGN KEY ("data_source_id") REFERENCES "public"."feedgraph_data_sources"("id") ON DELETE cascade ON UPDATE no action;