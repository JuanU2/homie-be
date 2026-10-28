ALTER TYPE "core"."roommate_application_status_enum" ADD VALUE 'VIEWING_OFFERED' BEFORE 'ACCEPTED';--> statement-breakpoint
ALTER TYPE "core"."roommate_application_status_enum" ADD VALUE 'VIEWING_CONFIRMED' BEFORE 'ACCEPTED';--> statement-breakpoint
ALTER TYPE "core"."roommate_application_status_enum" ADD VALUE 'VIEWING_DECLINED' BEFORE 'ACCEPTED';--> statement-breakpoint
ALTER TABLE "core"."roommate_applications" ADD COLUMN "viewing_options" timestamp with time zone[];--> statement-breakpoint
ALTER TABLE "core"."roommate_applications" ADD COLUMN "viewing_chosen_at" timestamp with time zone;