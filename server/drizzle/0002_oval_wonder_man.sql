ALTER TABLE "feedgraph_user_data_source_role" DROP CONSTRAINT "feedgraph_user_data_source_role_user_id_feedgraph_user_id_fk";
--> statement-breakpoint
ALTER TABLE "feedgraph_user_tenant" DROP CONSTRAINT "feedgraph_user_tenant_user_id_feedgraph_user_id_fk";
--> statement-breakpoint
ALTER TABLE "feedgraph_user_tenant" DROP CONSTRAINT "feedgraph_user_tenant_tenant_id_feedgraph_tenant_id_fk";
--> statement-breakpoint
ALTER TABLE "feedgraph_tenant" ADD COLUMN "created_by_id" uuid;--> statement-breakpoint
ALTER TABLE "feedgraph_tenant" ADD COLUMN "updated_by_id" uuid;--> statement-breakpoint
ALTER TABLE "feedgraph_tenant" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "feedgraph_tenant" ADD COLUMN "updated_at" timestamp;--> statement-breakpoint
ALTER TABLE "feedgraph_tenant" ADD CONSTRAINT "feedgraph_tenant_created_by_id_feedgraph_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."feedgraph_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_tenant" ADD CONSTRAINT "feedgraph_tenant_updated_by_id_feedgraph_user_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."feedgraph_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_user_data_source_role" ADD CONSTRAINT "feedgraph_user_data_source_role_user_id_feedgraph_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."feedgraph_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_user_tenant" ADD CONSTRAINT "feedgraph_user_tenant_user_id_feedgraph_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."feedgraph_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_user_tenant" ADD CONSTRAINT "feedgraph_user_tenant_tenant_id_feedgraph_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."feedgraph_tenant"("id") ON DELETE cascade ON UPDATE no action;