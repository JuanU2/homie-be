CREATE TABLE "core"."exchange_rates" (
	"currency" char(3) PRIMARY KEY NOT NULL,
	"eur_rate" numeric(18, 8) NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "core"."roommate_requests" ADD COLUMN "price_eur" numeric(18, 8);