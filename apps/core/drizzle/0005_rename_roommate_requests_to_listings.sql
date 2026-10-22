ALTER TABLE "core"."roommate_requests" RENAME TO "listings";--> statement-breakpoint
ALTER TYPE "core"."roommate_request_status_enum" RENAME TO "listing_status_enum";--> statement-breakpoint
ALTER TABLE "core"."roommate_applications" RENAME COLUMN "roommate_request_id" TO "listing_id";--> statement-breakpoint
ALTER TABLE "core"."favourites" RENAME COLUMN "roommate_request_id" TO "listing_id";--> statement-breakpoint
ALTER TABLE "core"."roommate_applications" RENAME CONSTRAINT "roommate_applications_roommate_request_id_roommate_requests_id_fk" TO "roommate_applications_listing_id_listings_id_fk";--> statement-breakpoint
ALTER TABLE "core"."favourites" RENAME CONSTRAINT "favourites_roommate_request_id_roommate_requests_id_fk" TO "favourites_listing_id_listings_id_fk";--> statement-breakpoint
ALTER TABLE "core"."listings" RENAME CONSTRAINT "roommate_requests_property_id_properties_id_fk" TO "listings_property_id_properties_id_fk";--> statement-breakpoint
ALTER TABLE "core"."listings" RENAME CONSTRAINT "roommate_requests_created_by_users_id_fk" TO "listings_created_by_users_id_fk";--> statement-breakpoint
ALTER INDEX "core"."favourites_user_roommate_request_unique" RENAME TO "favourites_user_listing_unique";
