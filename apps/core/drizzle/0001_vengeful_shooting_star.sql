CREATE TYPE "core"."point_of_interest_location_type_enum" AS ENUM('PUBLIC_TRANSPORT', 'CITY_CENTER');--> statement-breakpoint
CREATE TABLE "core"."points_of_interest" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"property_id" uuid NOT NULL,
	"lat" double precision NOT NULL,
	"lng" double precision NOT NULL,
	"location_type" "core"."point_of_interest_location_type_enum" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "core"."points_of_interest" ADD CONSTRAINT "points_of_interest_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "core"."properties"("id") ON DELETE cascade ON UPDATE no action;