ALTER TABLE "property_images" DROP CONSTRAINT "property_images_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "property_images" ADD COLUMN "property_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "property_images" ADD CONSTRAINT "property_images_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property_images" DROP COLUMN "user_id";