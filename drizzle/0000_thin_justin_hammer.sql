CREATE TYPE "public"."roommate_application_status_enum" AS ENUM('PENDING', 'ACCEPTED', 'REJECTED');--> statement-breakpoint
CREATE TYPE "public"."currency_enum" AS ENUM('EUR', 'CZK', 'USD');--> statement-breakpoint
CREATE TYPE "public"."roommate_request_status_enum" AS ENUM('ACTIVE', 'RESERVED', 'CLOSED', 'EXPIRED');--> statement-breakpoint
CREATE TYPE "public"."room_type_enum" AS ENUM('DORMITORY', 'BATHROOM', 'KITCHEN', 'LIVING_ROOM', 'TOILET', 'WARDROBE', 'BALCONY', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."interest_enum" AS ENUM('FIND_HOUSING', 'RENT');--> statement-breakpoint
CREATE TABLE "equipment_types" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "properties" (
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
	"location" "geography(Point, 4326)" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "property_images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"property_id" uuid NOT NULL,
	"image_url" varchar(255),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "property_equipment" (
	"property_id" uuid NOT NULL,
	"equipment_type_id" uuid NOT NULL,
	"quantity" integer NOT NULL,
	CONSTRAINT "property_equipment_property_id_equipment_type_id_pk" PRIMARY KEY("property_id","equipment_type_id")
);
--> statement-breakpoint
CREATE TABLE "roommate_applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"roommate_request_id" uuid NOT NULL,
	"applicant_id" uuid NOT NULL,
	"status" "roommate_application_status_enum" DEFAULT 'PENDING' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "roommate_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"property_id" uuid NOT NULL,
	"created_by" uuid NOT NULL,
	"description" text NOT NULL,
	"price_amount" integer NOT NULL,
	"price_currency" "currency_enum" NOT NULL,
	"ideal_move_in_date" date,
	"max_roommates" integer NOT NULL,
	"current_roommates" integer NOT NULL,
	"status" "roommate_request_status_enum" DEFAULT 'ACTIVE' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"closed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "property_rooms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"property_id" uuid NOT NULL,
	"room_type" "room_type_enum" NOT NULL,
	"count" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"phone_number" varchar(20),
	"primary_interest" "interest_enum",
	"ideal_location" "geography(Point, 4326)",
	CONSTRAINT "user_settings_phone_number_unique" UNIQUE("phone_number")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"full_name" varchar(255) NOT NULL,
	"image" varchar(255) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "properties" ADD CONSTRAINT "properties_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property_images" ADD CONSTRAINT "property_images_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property_equipment" ADD CONSTRAINT "property_equipment_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property_equipment" ADD CONSTRAINT "property_equipment_equipment_type_id_equipment_types_id_fk" FOREIGN KEY ("equipment_type_id") REFERENCES "public"."equipment_types"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roommate_applications" ADD CONSTRAINT "roommate_applications_roommate_request_id_roommate_requests_id_fk" FOREIGN KEY ("roommate_request_id") REFERENCES "public"."roommate_requests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roommate_applications" ADD CONSTRAINT "roommate_applications_applicant_id_users_id_fk" FOREIGN KEY ("applicant_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roommate_requests" ADD CONSTRAINT "roommate_requests_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roommate_requests" ADD CONSTRAINT "roommate_requests_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property_rooms" ADD CONSTRAINT "property_rooms_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_settings" ADD CONSTRAINT "user_settings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "equipment_types_name_unique" ON "equipment_types" USING btree ("name");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_unique" ON "users" USING btree ("email");