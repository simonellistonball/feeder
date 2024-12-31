CREATE TYPE "public"."feedgraph_status" AS ENUM('idea', 'planning', 'in_progress', 'complete', 'shipped', 'canceled', 'on_hold');--> statement-breakpoint
CREATE TYPE "public"."feedgraph_visibility" AS ENUM('public', 'internal', 'team', 'private');--> statement-breakpoint
CREATE TABLE "feedgraph_releases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"product_id" uuid NOT NULL,
	"title" text,
	"description" text,
	"image" varchar(255),
	"date_start" timestamp,
	"date_end" timestamp,
	"created_by_id" uuid NOT NULL,
	"updated_by_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"data_source_id" uuid
);
--> statement-breakpoint
CREATE TABLE "feedgraph_roadmaps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"product_id" uuid NOT NULL,
	"owner_id" uuid NOT NULL,
	"description" text,
	"color" varchar(8),
	"image" varchar(255),
	"visibility" "feedgraph_visibility" DEFAULT 'private' NOT NULL,
	"created_by_id" uuid NOT NULL,
	"updated_by_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"data_source_id" uuid
);
--> statement-breakpoint
CREATE TABLE "feedgraph_roadmaps_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"roadmap_id" uuid NOT NULL,
	"title" text,
	"description" text,
	"url" text,
	"feature_id" uuid,
	"status" "feedgraph_status" DEFAULT 'idea' NOT NULL,
	"date_start" timestamp,
	"date_end" timestamp,
	"release_date" timestamp,
	"release_id" uuid,
	"release_notes" text,
	"color" varchar(8),
	"created_by_id" uuid NOT NULL,
	"updated_by_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"data_source_id" uuid
);
--> statement-breakpoint
ALTER TABLE "feedgraph_releases" ADD CONSTRAINT "feedgraph_releases_product_id_feedgraph_features_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."feedgraph_features"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_releases" ADD CONSTRAINT "feedgraph_releases_created_by_id_feedgraph_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."feedgraph_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_releases" ADD CONSTRAINT "feedgraph_releases_updated_by_id_feedgraph_user_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."feedgraph_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_releases" ADD CONSTRAINT "feedgraph_releases_data_source_id_feedgraph_data_sources_id_fk" FOREIGN KEY ("data_source_id") REFERENCES "public"."feedgraph_data_sources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_roadmaps" ADD CONSTRAINT "feedgraph_roadmaps_product_id_feedgraph_features_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."feedgraph_features"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_roadmaps" ADD CONSTRAINT "feedgraph_roadmaps_owner_id_feedgraph_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."feedgraph_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_roadmaps" ADD CONSTRAINT "feedgraph_roadmaps_created_by_id_feedgraph_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."feedgraph_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_roadmaps" ADD CONSTRAINT "feedgraph_roadmaps_updated_by_id_feedgraph_user_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."feedgraph_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_roadmaps" ADD CONSTRAINT "feedgraph_roadmaps_data_source_id_feedgraph_data_sources_id_fk" FOREIGN KEY ("data_source_id") REFERENCES "public"."feedgraph_data_sources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_roadmaps_entries" ADD CONSTRAINT "feedgraph_roadmaps_entries_roadmap_id_feedgraph_roadmaps_id_fk" FOREIGN KEY ("roadmap_id") REFERENCES "public"."feedgraph_roadmaps"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_roadmaps_entries" ADD CONSTRAINT "feedgraph_roadmaps_entries_feature_id_feedgraph_features_id_fk" FOREIGN KEY ("feature_id") REFERENCES "public"."feedgraph_features"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_roadmaps_entries" ADD CONSTRAINT "feedgraph_roadmaps_entries_release_id_feedgraph_releases_id_fk" FOREIGN KEY ("release_id") REFERENCES "public"."feedgraph_releases"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_roadmaps_entries" ADD CONSTRAINT "feedgraph_roadmaps_entries_created_by_id_feedgraph_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."feedgraph_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_roadmaps_entries" ADD CONSTRAINT "feedgraph_roadmaps_entries_updated_by_id_feedgraph_user_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."feedgraph_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_roadmaps_entries" ADD CONSTRAINT "feedgraph_roadmaps_entries_data_source_id_feedgraph_data_sources_id_fk" FOREIGN KEY ("data_source_id") REFERENCES "public"."feedgraph_data_sources"("id") ON DELETE cascade ON UPDATE no action;