ALTER TYPE "public"."room_type_enum" ADD VALUE 'BALCONY';--> statement-breakpoint
ALTER TYPE "public"."room_type_enum" ADD VALUE 'OTHER';--> statement-breakpoint
CREATE TABLE "property_images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"image_url" varchar(255),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"primary_interest" "interest_enum" NOT NULL,
	"ideal_location" geography(Point, 4326)
);
--> statement-breakpoint
ALTER TABLE "conversation_participants" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "conversations" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "messages" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "conversation_participants" CASCADE;--> statement-breakpoint
DROP TABLE "conversations" CASCADE;--> statement-breakpoint
DROP TABLE "messages" CASCADE;--> statement-breakpoint
ALTER TABLE "rooms" RENAME COLUMN "size_m2" TO "count";--> statement-breakpoint
DROP INDEX "equipment_types_name_unique";--> statement-breakpoint
ALTER TABLE "room_equipment" DROP CONSTRAINT "room_equipment_room_id_equipment_type_id_pk";--> statement-breakpoint
ALTER TABLE "properties" ALTER COLUMN "street" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "full_name" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "image" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "property_images" ADD CONSTRAINT "property_images_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_settings" ADD CONSTRAINT "user_settings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "password_hash";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "first_name";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "last_name";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "primary_interest";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "ideal_location";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "phone";