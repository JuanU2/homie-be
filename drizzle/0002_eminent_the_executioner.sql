ALTER TABLE "user_settings" ALTER COLUMN "primary_interest" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "user_settings" ADD COLUMN "phone_number" varchar(20);--> statement-breakpoint
ALTER TABLE "user_settings" ADD CONSTRAINT "user_settings_phone_number_unique" UNIQUE("phone_number");