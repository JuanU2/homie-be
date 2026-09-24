CREATE TABLE "worker"."roommate_requests" (
	"roommate_request_id" uuid PRIMARY KEY NOT NULL,
	"property_id" uuid NOT NULL,
	"data" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "worker"."property_insights" (
	"property_id" uuid PRIMARY KEY NOT NULL,
	"insight" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "roommate_requests_property_id_idx" ON "worker"."roommate_requests" USING btree ("property_id");