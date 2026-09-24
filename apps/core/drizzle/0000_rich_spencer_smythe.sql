CREATE SCHEMA "core";--> statement-breakpoint
CREATE TYPE "core"."roommate_application_status_enum" AS ENUM('PENDING', 'ACCEPTED', 'REJECTED');--> statement-breakpoint
CREATE TYPE "core"."currency_enum" AS ENUM('EUR', 'CZK', 'USD');--> statement-breakpoint
CREATE TYPE "core"."roommate_request_status_enum" AS ENUM('ACTIVE', 'RESERVED', 'CLOSED', 'EXPIRED');--> statement-breakpoint
CREATE TYPE "core"."room_type_enum" AS ENUM('DORMITORY', 'BATHROOM', 'KITCHEN', 'LIVING_ROOM', 'TOILET', 'WARDROBE', 'BALCONY', 'OTHER');--> statement-breakpoint
CREATE TYPE "core"."interest_enum" AS ENUM('FIND_HOUSING', 'RENT');--> statement-breakpoint
CREATE TABLE "core"."equipment_types" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "core"."properties" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" uuid NOT NULL,
	"description" text NOT NULL,
	"size_m2" integer,
	"room_count" integer NOT NULL,
	"country" varchar(255) NOT NULL,
	"city" varchar(255) NOT NULL,
	"zip_code" varchar(50) NOT NULL,
	"street" varchar(255) NOT NULL,
	"street_number" varchar(50) NOT NULL,
	"location" geography(Point, 4326) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "core"."property_images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"property_id" uuid NOT NULL,
	"image_url" varchar(255),
	"title" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "core"."property_equipment" (
	"property_id" uuid NOT NULL,
	"equipment_type_id" uuid NOT NULL,
	"quantity" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "property_equipment_property_id_equipment_type_id_pk" PRIMARY KEY("property_id","equipment_type_id")
);
--> statement-breakpoint
CREATE TABLE "core"."roommate_applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"roommate_request_id" uuid NOT NULL,
	"applicant_id" uuid NOT NULL,
	"status" "core"."roommate_application_status_enum" DEFAULT 'PENDING' NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "core"."roommate_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"property_id" uuid NOT NULL,
	"created_by" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"price_amount" integer NOT NULL,
	"price_currency" "core"."currency_enum" NOT NULL,
	"ideal_move_in_date" date,
	"max_roommates" integer NOT NULL,
	"current_roommates" integer NOT NULL,
	"status" "core"."roommate_request_status_enum" DEFAULT 'ACTIVE' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"closed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "core"."property_rooms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"property_id" uuid NOT NULL,
	"room_type" "core"."room_type_enum" NOT NULL,
	"count" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "core"."user_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"phone_number" varchar(20),
	"primary_interest" "core"."interest_enum",
	"ideal_location" geography(Point, 4326),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_settings_phone_number_unique" UNIQUE("phone_number")
);
--> statement-breakpoint
CREATE TABLE "core"."users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"google_sub" varchar(255),
	"email" varchar(255) NOT NULL,
	"full_name" varchar(255) NOT NULL,
	"image" varchar(255) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "core"."device_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "core"."properties" ADD CONSTRAINT "properties_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "core"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core"."property_images" ADD CONSTRAINT "property_images_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "core"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core"."property_equipment" ADD CONSTRAINT "property_equipment_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "core"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core"."property_equipment" ADD CONSTRAINT "property_equipment_equipment_type_id_equipment_types_id_fk" FOREIGN KEY ("equipment_type_id") REFERENCES "core"."equipment_types"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core"."roommate_applications" ADD CONSTRAINT "roommate_applications_roommate_request_id_roommate_requests_id_fk" FOREIGN KEY ("roommate_request_id") REFERENCES "core"."roommate_requests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core"."roommate_applications" ADD CONSTRAINT "roommate_applications_applicant_id_users_id_fk" FOREIGN KEY ("applicant_id") REFERENCES "core"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core"."roommate_requests" ADD CONSTRAINT "roommate_requests_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "core"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core"."roommate_requests" ADD CONSTRAINT "roommate_requests_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "core"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core"."property_rooms" ADD CONSTRAINT "property_rooms_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "core"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core"."user_settings" ADD CONSTRAINT "user_settings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "core"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core"."device_tokens" ADD CONSTRAINT "device_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "core"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "equipment_types_name_unique" ON "core"."equipment_types" USING btree ("name");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_unique" ON "core"."users" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "users_google_sub_unique" ON "core"."users" USING btree ("google_sub");--> statement-breakpoint
CREATE UNIQUE INDEX "device_tokens_token_unique" ON "core"."device_tokens" USING btree ("token");