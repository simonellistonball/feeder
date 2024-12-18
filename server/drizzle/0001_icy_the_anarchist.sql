ALTER TABLE "feedgraph_tenant" DROP CONSTRAINT "feedgraph_tenant_created_by_id_feedgraph_user_id_fk";
--> statement-breakpoint
ALTER TABLE "feedgraph_tenant" DROP CONSTRAINT "feedgraph_tenant_updated_by_id_feedgraph_user_id_fk";
--> statement-breakpoint
ALTER TABLE "feedgraph_tenant" DROP CONSTRAINT "feedgraph_tenant_data_source_id_feedgraph_data_sources_id_fk";
--> statement-breakpoint
ALTER TABLE "feedgraph_user_tenant" DROP CONSTRAINT "feedgraph_user_tenant_tenant_id_feedgraph_user_id_fk";
--> statement-breakpoint
ALTER TABLE "feedgraph_user_tenant" ADD CONSTRAINT "feedgraph_user_tenant_tenant_id_feedgraph_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."feedgraph_tenant"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_tenant" DROP COLUMN "created_by_id";--> statement-breakpoint
ALTER TABLE "feedgraph_tenant" DROP COLUMN "updated_by_id";--> statement-breakpoint
ALTER TABLE "feedgraph_tenant" DROP COLUMN "created_at";--> statement-breakpoint
ALTER TABLE "feedgraph_tenant" DROP COLUMN "updated_at";--> statement-breakpoint
ALTER TABLE "feedgraph_tenant" DROP COLUMN "data_source_id";