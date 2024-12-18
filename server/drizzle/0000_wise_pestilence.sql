CREATE TYPE "public"."feedgraph_role" AS ENUM('viewer', 'contributor', 'editor', 'admin');--> statement-breakpoint
CREATE TABLE "feedgraph_data_sources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"tenant_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "feedgraph_tenant" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"domain" varchar(255),
	"created_by_id" uuid NOT NULL,
	"updated_by_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"data_source_id" uuid
);
--> statement-breakpoint
CREATE TABLE "feedgraph_account" (
	"user_id" uuid NOT NULL,
	"type" varchar(255) NOT NULL,
	"provider" varchar(255) NOT NULL,
	"provider_account_id" varchar(255) NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" varchar(255),
	"scope" text,
	"id_token" text,
	"session_state" text
);
--> statement-breakpoint
CREATE TABLE "feedgraph_session" (
	"session_token" text PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"expires" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "feedgraph_user_data_source_role" (
	"user_id" uuid NOT NULL,
	"role" "feedgraph_role" NOT NULL,
	"created_by_id" uuid NOT NULL,
	"updated_by_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"data_source_id" uuid
);
--> statement-breakpoint
CREATE TABLE "feedgraph_user_tenant" (
	"user_id" uuid NOT NULL,
	"tenant_id" uuid NOT NULL,
	"role" "feedgraph_role" NOT NULL,
	"created_by_id" uuid NOT NULL,
	"updated_by_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"data_source_id" uuid
);
--> statement-breakpoint
CREATE TABLE "feedgraph_user" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"email" varchar(255) NOT NULL,
	"email_verified" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"image" varchar(255),
	"source" varchar(255),
	"created_by_id" uuid,
	"updated_by_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"data_source_id" uuid
);
--> statement-breakpoint
CREATE TABLE "feedgraph_verification_token" (
	"identifier" varchar(255) NOT NULL,
	"token" varchar(255) NOT NULL,
	"expires" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "feedgraph_companies" (
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
CREATE TABLE "feedgraph_company_addresses" (
	"companyId" uuid NOT NULL,
	"addressId" uuid NOT NULL,
	"created_by_id" uuid NOT NULL,
	"updated_by_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"data_source_id" uuid
);
--> statement-breakpoint
CREATE TABLE "feedgraph_company_people" (
	"companyId" uuid NOT NULL,
	"peopleId" uuid NOT NULL,
	"created_by_id" uuid NOT NULL,
	"updated_by_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"data_source_id" uuid
);
--> statement-breakpoint
CREATE TABLE "feedgraph_company_phones" (
	"companyId" uuid NOT NULL,
	"phoneId" uuid NOT NULL,
	"created_by_id" uuid NOT NULL,
	"updated_by_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"data_source_id" uuid
);
--> statement-breakpoint
CREATE TABLE "feedgraph_customers_people" (
	"customerId" uuid NOT NULL,
	"peopleId" uuid NOT NULL,
	"created_by_id" uuid NOT NULL,
	"updated_by_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"data_source_id" uuid
);
--> statement-breakpoint
CREATE TABLE "feedgraph_customers" (
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
CREATE TABLE "feedgraph_addresses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"street" varchar NOT NULL,
	"city" varchar NOT NULL,
	"state" varchar NOT NULL,
	"zip" varchar NOT NULL,
	"country" varchar NOT NULL,
	"created_by_id" uuid NOT NULL,
	"updated_by_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"data_source_id" uuid
);
--> statement-breakpoint
CREATE TABLE "feedgraph_people" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"uid" varchar(255),
	"title" varchar,
	"prefix" varchar,
	"suffix" varchar,
	"first_name" varchar NOT NULL,
	"last_name" varchar NOT NULL,
	"organization" varchar(255),
	"email" varchar,
	"email_work" varchar,
	"homePhone" uuid,
	"workPhone" uuid,
	"mobilePhone" uuid,
	"homeAddress" uuid,
	"workAddress" uuid,
	"billingAddress" uuid,
	"shippingAddress" uuid,
	"created_by_id" uuid NOT NULL,
	"updated_by_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"data_source_id" uuid
);
--> statement-breakpoint
CREATE TABLE "feedgraph_phone_numbers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"number" varchar NOT NULL,
	"type" varchar NOT NULL,
	"created_by_id" uuid NOT NULL,
	"updated_by_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"data_source_id" uuid
);
--> statement-breakpoint
CREATE TABLE "feedgraph_companies_tags" (
	"tag_id" uuid,
	"company_id" uuid,
	"created_by_id" uuid NOT NULL,
	"updated_by_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"data_source_id" uuid
);
--> statement-breakpoint
CREATE TABLE "feedgraph_customer_tags" (
	"tag_id" uuid,
	"customer_id" uuid,
	"created_by_id" uuid NOT NULL,
	"updated_by_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"data_source_id" uuid
);
--> statement-breakpoint
CREATE TABLE "feedgraph_feedback_tags" (
	"tag_id" uuid,
	"feedback_id" uuid,
	"created_by_id" uuid NOT NULL,
	"updated_by_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"data_source_id" uuid
);
--> statement-breakpoint
CREATE TABLE "feedgraph_people_tags" (
	"tag_id" uuid,
	"user_id" uuid,
	"created_by_id" uuid NOT NULL,
	"updated_by_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"data_source_id" uuid
);
--> statement-breakpoint
CREATE TABLE "feedgraph_product_tags" (
	"tag_id" uuid,
	"product_id" uuid,
	"created_by_id" uuid NOT NULL,
	"updated_by_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"data_source_id" uuid
);
--> statement-breakpoint
CREATE TABLE "feedgraph_tags" (
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
CREATE TABLE "feedgraph_teams_tags" (
	"tag_id" uuid,
	"team_id" uuid,
	"created_by_id" uuid NOT NULL,
	"updated_by_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"data_source_id" uuid
);
--> statement-breakpoint
CREATE TABLE "feedgraph_features" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"parent_id" uuid,
	"product_id" uuid,
	"description" text NOT NULL,
	"created_by_id" uuid NOT NULL,
	"updated_by_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"data_source_id" uuid
);
--> statement-breakpoint
CREATE TABLE "feedgraph_products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"description" text NOT NULL,
	"product_group" uuid,
	"created_by_id" uuid NOT NULL,
	"updated_by_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"data_source_id" uuid
);
--> statement-breakpoint
CREATE TABLE "feedgraph_product_groups" (
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
CREATE TABLE "feedgraph_team_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" uuid,
	"user_id" uuid,
	"role_id" uuid,
	"date_start" timestamp with time zone DEFAULT now() NOT NULL,
	"date_end" timestamp with time zone,
	"created_by_id" uuid NOT NULL,
	"updated_by_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"data_source_id" uuid
);
--> statement-breakpoint
CREATE TABLE "feedgraph_team_roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"description" text,
	"abbr" varchar(20),
	"created_by_id" uuid NOT NULL,
	"updated_by_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"data_source_id" uuid
);
--> statement-breakpoint
CREATE TABLE "feedgraph_teams" (
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
CREATE TABLE "feedgraph_feedback" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"content" text NOT NULL,
	"summary" text,
	"created_by_id" uuid NOT NULL,
	"updated_by_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"data_source_id" uuid
);
--> statement-breakpoint
CREATE TABLE "feedgraph_feedback_copied_users" (
	"feedback_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"created_by_id" uuid NOT NULL,
	"updated_by_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"data_source_id" uuid
);
--> statement-breakpoint
ALTER TABLE "feedgraph_data_sources" ADD CONSTRAINT "feedgraph_data_sources_tenant_id_feedgraph_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."feedgraph_tenant"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_tenant" ADD CONSTRAINT "feedgraph_tenant_created_by_id_feedgraph_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."feedgraph_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_tenant" ADD CONSTRAINT "feedgraph_tenant_updated_by_id_feedgraph_user_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."feedgraph_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_tenant" ADD CONSTRAINT "feedgraph_tenant_data_source_id_feedgraph_data_sources_id_fk" FOREIGN KEY ("data_source_id") REFERENCES "public"."feedgraph_data_sources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_account" ADD CONSTRAINT "feedgraph_account_user_id_feedgraph_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."feedgraph_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_session" ADD CONSTRAINT "feedgraph_session_user_id_feedgraph_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."feedgraph_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_user_data_source_role" ADD CONSTRAINT "feedgraph_user_data_source_role_user_id_feedgraph_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."feedgraph_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_user_data_source_role" ADD CONSTRAINT "feedgraph_user_data_source_role_created_by_id_feedgraph_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."feedgraph_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_user_data_source_role" ADD CONSTRAINT "feedgraph_user_data_source_role_updated_by_id_feedgraph_user_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."feedgraph_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_user_data_source_role" ADD CONSTRAINT "feedgraph_user_data_source_role_data_source_id_feedgraph_data_sources_id_fk" FOREIGN KEY ("data_source_id") REFERENCES "public"."feedgraph_data_sources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_user_tenant" ADD CONSTRAINT "feedgraph_user_tenant_user_id_feedgraph_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."feedgraph_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_user_tenant" ADD CONSTRAINT "feedgraph_user_tenant_tenant_id_feedgraph_user_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."feedgraph_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_user_tenant" ADD CONSTRAINT "feedgraph_user_tenant_created_by_id_feedgraph_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."feedgraph_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_user_tenant" ADD CONSTRAINT "feedgraph_user_tenant_updated_by_id_feedgraph_user_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."feedgraph_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_user_tenant" ADD CONSTRAINT "feedgraph_user_tenant_data_source_id_feedgraph_data_sources_id_fk" FOREIGN KEY ("data_source_id") REFERENCES "public"."feedgraph_data_sources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_user" ADD CONSTRAINT "feedgraph_user_created_by_id_feedgraph_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."feedgraph_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_user" ADD CONSTRAINT "feedgraph_user_updated_by_id_feedgraph_user_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."feedgraph_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_user" ADD CONSTRAINT "feedgraph_user_data_source_id_feedgraph_data_sources_id_fk" FOREIGN KEY ("data_source_id") REFERENCES "public"."feedgraph_data_sources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_companies" ADD CONSTRAINT "feedgraph_companies_created_by_id_feedgraph_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."feedgraph_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_companies" ADD CONSTRAINT "feedgraph_companies_updated_by_id_feedgraph_user_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."feedgraph_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_companies" ADD CONSTRAINT "feedgraph_companies_data_source_id_feedgraph_data_sources_id_fk" FOREIGN KEY ("data_source_id") REFERENCES "public"."feedgraph_data_sources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_company_addresses" ADD CONSTRAINT "feedgraph_company_addresses_companyId_feedgraph_companies_id_fk" FOREIGN KEY ("companyId") REFERENCES "public"."feedgraph_companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_company_addresses" ADD CONSTRAINT "feedgraph_company_addresses_addressId_feedgraph_addresses_id_fk" FOREIGN KEY ("addressId") REFERENCES "public"."feedgraph_addresses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_company_addresses" ADD CONSTRAINT "feedgraph_company_addresses_created_by_id_feedgraph_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."feedgraph_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_company_addresses" ADD CONSTRAINT "feedgraph_company_addresses_updated_by_id_feedgraph_user_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."feedgraph_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_company_addresses" ADD CONSTRAINT "feedgraph_company_addresses_data_source_id_feedgraph_data_sources_id_fk" FOREIGN KEY ("data_source_id") REFERENCES "public"."feedgraph_data_sources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_company_people" ADD CONSTRAINT "feedgraph_company_people_companyId_feedgraph_companies_id_fk" FOREIGN KEY ("companyId") REFERENCES "public"."feedgraph_companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_company_people" ADD CONSTRAINT "feedgraph_company_people_peopleId_feedgraph_people_id_fk" FOREIGN KEY ("peopleId") REFERENCES "public"."feedgraph_people"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_company_people" ADD CONSTRAINT "feedgraph_company_people_created_by_id_feedgraph_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."feedgraph_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_company_people" ADD CONSTRAINT "feedgraph_company_people_updated_by_id_feedgraph_user_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."feedgraph_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_company_people" ADD CONSTRAINT "feedgraph_company_people_data_source_id_feedgraph_data_sources_id_fk" FOREIGN KEY ("data_source_id") REFERENCES "public"."feedgraph_data_sources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_company_phones" ADD CONSTRAINT "feedgraph_company_phones_companyId_feedgraph_companies_id_fk" FOREIGN KEY ("companyId") REFERENCES "public"."feedgraph_companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_company_phones" ADD CONSTRAINT "feedgraph_company_phones_phoneId_feedgraph_phone_numbers_id_fk" FOREIGN KEY ("phoneId") REFERENCES "public"."feedgraph_phone_numbers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_company_phones" ADD CONSTRAINT "feedgraph_company_phones_created_by_id_feedgraph_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."feedgraph_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_company_phones" ADD CONSTRAINT "feedgraph_company_phones_updated_by_id_feedgraph_user_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."feedgraph_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_company_phones" ADD CONSTRAINT "feedgraph_company_phones_data_source_id_feedgraph_data_sources_id_fk" FOREIGN KEY ("data_source_id") REFERENCES "public"."feedgraph_data_sources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_customers_people" ADD CONSTRAINT "feedgraph_customers_people_customerId_feedgraph_customers_id_fk" FOREIGN KEY ("customerId") REFERENCES "public"."feedgraph_customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_customers_people" ADD CONSTRAINT "feedgraph_customers_people_peopleId_feedgraph_people_id_fk" FOREIGN KEY ("peopleId") REFERENCES "public"."feedgraph_people"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_customers_people" ADD CONSTRAINT "feedgraph_customers_people_created_by_id_feedgraph_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."feedgraph_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_customers_people" ADD CONSTRAINT "feedgraph_customers_people_updated_by_id_feedgraph_user_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."feedgraph_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_customers_people" ADD CONSTRAINT "feedgraph_customers_people_data_source_id_feedgraph_data_sources_id_fk" FOREIGN KEY ("data_source_id") REFERENCES "public"."feedgraph_data_sources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_customers" ADD CONSTRAINT "feedgraph_customers_created_by_id_feedgraph_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."feedgraph_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_customers" ADD CONSTRAINT "feedgraph_customers_updated_by_id_feedgraph_user_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."feedgraph_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_customers" ADD CONSTRAINT "feedgraph_customers_data_source_id_feedgraph_data_sources_id_fk" FOREIGN KEY ("data_source_id") REFERENCES "public"."feedgraph_data_sources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_addresses" ADD CONSTRAINT "feedgraph_addresses_created_by_id_feedgraph_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."feedgraph_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_addresses" ADD CONSTRAINT "feedgraph_addresses_updated_by_id_feedgraph_user_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."feedgraph_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_addresses" ADD CONSTRAINT "feedgraph_addresses_data_source_id_feedgraph_data_sources_id_fk" FOREIGN KEY ("data_source_id") REFERENCES "public"."feedgraph_data_sources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_people" ADD CONSTRAINT "feedgraph_people_homePhone_feedgraph_phone_numbers_id_fk" FOREIGN KEY ("homePhone") REFERENCES "public"."feedgraph_phone_numbers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_people" ADD CONSTRAINT "feedgraph_people_workPhone_feedgraph_phone_numbers_id_fk" FOREIGN KEY ("workPhone") REFERENCES "public"."feedgraph_phone_numbers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_people" ADD CONSTRAINT "feedgraph_people_mobilePhone_feedgraph_phone_numbers_id_fk" FOREIGN KEY ("mobilePhone") REFERENCES "public"."feedgraph_phone_numbers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_people" ADD CONSTRAINT "feedgraph_people_homeAddress_feedgraph_addresses_id_fk" FOREIGN KEY ("homeAddress") REFERENCES "public"."feedgraph_addresses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_people" ADD CONSTRAINT "feedgraph_people_workAddress_feedgraph_addresses_id_fk" FOREIGN KEY ("workAddress") REFERENCES "public"."feedgraph_addresses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_people" ADD CONSTRAINT "feedgraph_people_billingAddress_feedgraph_addresses_id_fk" FOREIGN KEY ("billingAddress") REFERENCES "public"."feedgraph_addresses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_people" ADD CONSTRAINT "feedgraph_people_shippingAddress_feedgraph_addresses_id_fk" FOREIGN KEY ("shippingAddress") REFERENCES "public"."feedgraph_addresses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_people" ADD CONSTRAINT "feedgraph_people_created_by_id_feedgraph_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."feedgraph_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_people" ADD CONSTRAINT "feedgraph_people_updated_by_id_feedgraph_user_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."feedgraph_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_people" ADD CONSTRAINT "feedgraph_people_data_source_id_feedgraph_data_sources_id_fk" FOREIGN KEY ("data_source_id") REFERENCES "public"."feedgraph_data_sources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_phone_numbers" ADD CONSTRAINT "feedgraph_phone_numbers_created_by_id_feedgraph_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."feedgraph_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_phone_numbers" ADD CONSTRAINT "feedgraph_phone_numbers_updated_by_id_feedgraph_user_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."feedgraph_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_phone_numbers" ADD CONSTRAINT "feedgraph_phone_numbers_data_source_id_feedgraph_data_sources_id_fk" FOREIGN KEY ("data_source_id") REFERENCES "public"."feedgraph_data_sources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_companies_tags" ADD CONSTRAINT "feedgraph_companies_tags_tag_id_feedgraph_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."feedgraph_tags"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_companies_tags" ADD CONSTRAINT "feedgraph_companies_tags_company_id_feedgraph_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."feedgraph_companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_companies_tags" ADD CONSTRAINT "feedgraph_companies_tags_created_by_id_feedgraph_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."feedgraph_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_companies_tags" ADD CONSTRAINT "feedgraph_companies_tags_updated_by_id_feedgraph_user_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."feedgraph_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_companies_tags" ADD CONSTRAINT "feedgraph_companies_tags_data_source_id_feedgraph_data_sources_id_fk" FOREIGN KEY ("data_source_id") REFERENCES "public"."feedgraph_data_sources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_customer_tags" ADD CONSTRAINT "feedgraph_customer_tags_tag_id_feedgraph_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."feedgraph_tags"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_customer_tags" ADD CONSTRAINT "feedgraph_customer_tags_customer_id_feedgraph_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."feedgraph_customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_customer_tags" ADD CONSTRAINT "feedgraph_customer_tags_created_by_id_feedgraph_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."feedgraph_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_customer_tags" ADD CONSTRAINT "feedgraph_customer_tags_updated_by_id_feedgraph_user_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."feedgraph_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_customer_tags" ADD CONSTRAINT "feedgraph_customer_tags_data_source_id_feedgraph_data_sources_id_fk" FOREIGN KEY ("data_source_id") REFERENCES "public"."feedgraph_data_sources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_feedback_tags" ADD CONSTRAINT "feedgraph_feedback_tags_tag_id_feedgraph_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."feedgraph_tags"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_feedback_tags" ADD CONSTRAINT "feedgraph_feedback_tags_feedback_id_feedgraph_feedback_id_fk" FOREIGN KEY ("feedback_id") REFERENCES "public"."feedgraph_feedback"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_feedback_tags" ADD CONSTRAINT "feedgraph_feedback_tags_created_by_id_feedgraph_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."feedgraph_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_feedback_tags" ADD CONSTRAINT "feedgraph_feedback_tags_updated_by_id_feedgraph_user_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."feedgraph_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_feedback_tags" ADD CONSTRAINT "feedgraph_feedback_tags_data_source_id_feedgraph_data_sources_id_fk" FOREIGN KEY ("data_source_id") REFERENCES "public"."feedgraph_data_sources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_people_tags" ADD CONSTRAINT "feedgraph_people_tags_tag_id_feedgraph_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."feedgraph_tags"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_people_tags" ADD CONSTRAINT "feedgraph_people_tags_user_id_feedgraph_people_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."feedgraph_people"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_people_tags" ADD CONSTRAINT "feedgraph_people_tags_created_by_id_feedgraph_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."feedgraph_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_people_tags" ADD CONSTRAINT "feedgraph_people_tags_updated_by_id_feedgraph_user_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."feedgraph_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_people_tags" ADD CONSTRAINT "feedgraph_people_tags_data_source_id_feedgraph_data_sources_id_fk" FOREIGN KEY ("data_source_id") REFERENCES "public"."feedgraph_data_sources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_product_tags" ADD CONSTRAINT "feedgraph_product_tags_tag_id_feedgraph_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."feedgraph_tags"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_product_tags" ADD CONSTRAINT "feedgraph_product_tags_product_id_feedgraph_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."feedgraph_products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_product_tags" ADD CONSTRAINT "feedgraph_product_tags_created_by_id_feedgraph_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."feedgraph_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_product_tags" ADD CONSTRAINT "feedgraph_product_tags_updated_by_id_feedgraph_user_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."feedgraph_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_product_tags" ADD CONSTRAINT "feedgraph_product_tags_data_source_id_feedgraph_data_sources_id_fk" FOREIGN KEY ("data_source_id") REFERENCES "public"."feedgraph_data_sources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_tags" ADD CONSTRAINT "feedgraph_tags_created_by_id_feedgraph_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."feedgraph_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_tags" ADD CONSTRAINT "feedgraph_tags_updated_by_id_feedgraph_user_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."feedgraph_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_tags" ADD CONSTRAINT "feedgraph_tags_data_source_id_feedgraph_data_sources_id_fk" FOREIGN KEY ("data_source_id") REFERENCES "public"."feedgraph_data_sources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_teams_tags" ADD CONSTRAINT "feedgraph_teams_tags_tag_id_feedgraph_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."feedgraph_tags"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_teams_tags" ADD CONSTRAINT "feedgraph_teams_tags_team_id_feedgraph_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."feedgraph_teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_teams_tags" ADD CONSTRAINT "feedgraph_teams_tags_created_by_id_feedgraph_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."feedgraph_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_teams_tags" ADD CONSTRAINT "feedgraph_teams_tags_updated_by_id_feedgraph_user_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."feedgraph_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_teams_tags" ADD CONSTRAINT "feedgraph_teams_tags_data_source_id_feedgraph_data_sources_id_fk" FOREIGN KEY ("data_source_id") REFERENCES "public"."feedgraph_data_sources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_features" ADD CONSTRAINT "feedgraph_features_parent_id_feedgraph_features_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."feedgraph_features"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_features" ADD CONSTRAINT "feedgraph_features_product_id_feedgraph_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."feedgraph_products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_features" ADD CONSTRAINT "feedgraph_features_created_by_id_feedgraph_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."feedgraph_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_features" ADD CONSTRAINT "feedgraph_features_updated_by_id_feedgraph_user_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."feedgraph_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_features" ADD CONSTRAINT "feedgraph_features_data_source_id_feedgraph_data_sources_id_fk" FOREIGN KEY ("data_source_id") REFERENCES "public"."feedgraph_data_sources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_products" ADD CONSTRAINT "feedgraph_products_product_group_feedgraph_product_groups_id_fk" FOREIGN KEY ("product_group") REFERENCES "public"."feedgraph_product_groups"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_products" ADD CONSTRAINT "feedgraph_products_created_by_id_feedgraph_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."feedgraph_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_products" ADD CONSTRAINT "feedgraph_products_updated_by_id_feedgraph_user_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."feedgraph_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_products" ADD CONSTRAINT "feedgraph_products_data_source_id_feedgraph_data_sources_id_fk" FOREIGN KEY ("data_source_id") REFERENCES "public"."feedgraph_data_sources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_product_groups" ADD CONSTRAINT "feedgraph_product_groups_created_by_id_feedgraph_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."feedgraph_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_product_groups" ADD CONSTRAINT "feedgraph_product_groups_updated_by_id_feedgraph_user_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."feedgraph_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_product_groups" ADD CONSTRAINT "feedgraph_product_groups_data_source_id_feedgraph_data_sources_id_fk" FOREIGN KEY ("data_source_id") REFERENCES "public"."feedgraph_data_sources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_team_members" ADD CONSTRAINT "feedgraph_team_members_team_id_feedgraph_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."feedgraph_teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_team_members" ADD CONSTRAINT "feedgraph_team_members_user_id_feedgraph_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."feedgraph_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_team_members" ADD CONSTRAINT "feedgraph_team_members_role_id_feedgraph_team_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."feedgraph_team_roles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_team_members" ADD CONSTRAINT "feedgraph_team_members_created_by_id_feedgraph_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."feedgraph_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_team_members" ADD CONSTRAINT "feedgraph_team_members_updated_by_id_feedgraph_user_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."feedgraph_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_team_members" ADD CONSTRAINT "feedgraph_team_members_data_source_id_feedgraph_data_sources_id_fk" FOREIGN KEY ("data_source_id") REFERENCES "public"."feedgraph_data_sources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_team_roles" ADD CONSTRAINT "feedgraph_team_roles_created_by_id_feedgraph_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."feedgraph_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_team_roles" ADD CONSTRAINT "feedgraph_team_roles_updated_by_id_feedgraph_user_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."feedgraph_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_team_roles" ADD CONSTRAINT "feedgraph_team_roles_data_source_id_feedgraph_data_sources_id_fk" FOREIGN KEY ("data_source_id") REFERENCES "public"."feedgraph_data_sources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_teams" ADD CONSTRAINT "feedgraph_teams_created_by_id_feedgraph_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."feedgraph_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_teams" ADD CONSTRAINT "feedgraph_teams_updated_by_id_feedgraph_user_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."feedgraph_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_teams" ADD CONSTRAINT "feedgraph_teams_data_source_id_feedgraph_data_sources_id_fk" FOREIGN KEY ("data_source_id") REFERENCES "public"."feedgraph_data_sources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_feedback" ADD CONSTRAINT "feedgraph_feedback_created_by_id_feedgraph_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."feedgraph_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_feedback" ADD CONSTRAINT "feedgraph_feedback_updated_by_id_feedgraph_user_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."feedgraph_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_feedback" ADD CONSTRAINT "feedgraph_feedback_data_source_id_feedgraph_data_sources_id_fk" FOREIGN KEY ("data_source_id") REFERENCES "public"."feedgraph_data_sources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_feedback_copied_users" ADD CONSTRAINT "feedgraph_feedback_copied_users_feedback_id_feedgraph_feedback_id_fk" FOREIGN KEY ("feedback_id") REFERENCES "public"."feedgraph_feedback"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_feedback_copied_users" ADD CONSTRAINT "feedgraph_feedback_copied_users_user_id_feedgraph_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."feedgraph_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_feedback_copied_users" ADD CONSTRAINT "feedgraph_feedback_copied_users_created_by_id_feedgraph_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."feedgraph_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_feedback_copied_users" ADD CONSTRAINT "feedgraph_feedback_copied_users_updated_by_id_feedgraph_user_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."feedgraph_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedgraph_feedback_copied_users" ADD CONSTRAINT "feedgraph_feedback_copied_users_data_source_id_feedgraph_data_sources_id_fk" FOREIGN KEY ("data_source_id") REFERENCES "public"."feedgraph_data_sources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "feedgraph_idx_addresses_postalCode" ON "feedgraph_addresses" USING btree ("zip");--> statement-breakpoint
CREATE INDEX "feedgraph_idx_addresses_city" ON "feedgraph_addresses" USING btree ("city");--> statement-breakpoint
CREATE INDEX "feedgraph_idx_people_email" ON "feedgraph_people" USING btree ("email");--> statement-breakpoint
CREATE INDEX "feedgraph_idx_people_workEmail" ON "feedgraph_people" USING btree ("email_work");--> statement-breakpoint
CREATE MATERIALIZED VIEW "public"."feedgraph_product_managers" AS (select "feedgraph_user"."id", "feedgraph_user"."name", "feedgraph_user"."email", "feedgraph_user"."image" from "feedgraph_user" inner join "feedgraph_team_members" on "feedgraph_team_members"."user_id" = "feedgraph_user"."id" inner join "feedgraph_team_roles" on "feedgraph_team_members"."role_id" = "feedgraph_team_roles"."id" where "feedgraph_team_roles"."name" = 'Product Manager');--> statement-breakpoint
CREATE MATERIALIZED VIEW "public"."feedgraph_teams_and_roles" AS (select "feedgraph_team_members"."user_id", "feedgraph_team_members"."team_id", "feedgraph_teams"."name", "feedgraph_team_members"."role_id", "feedgraph_team_roles"."name" as "role" from "feedgraph_team_members" inner join "feedgraph_teams" on "feedgraph_team_members"."team_id" = "feedgraph_teams"."id" inner join "feedgraph_team_roles" on "feedgraph_team_members"."role_id" = "feedgraph_team_roles"."id");