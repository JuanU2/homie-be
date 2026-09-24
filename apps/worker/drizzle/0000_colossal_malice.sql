CREATE SCHEMA "worker";--> statement-breakpoint
CREATE TABLE "worker"."equipment_types" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "equipment_types_name_unique" ON "worker"."equipment_types" USING btree ("name");