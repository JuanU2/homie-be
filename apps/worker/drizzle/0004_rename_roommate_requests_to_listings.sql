ALTER TABLE "worker"."roommate_requests" RENAME TO "listings";--> statement-breakpoint
ALTER TABLE "worker"."listings" RENAME COLUMN "roommate_request_id" TO "listing_id";--> statement-breakpoint
ALTER TABLE "worker"."conversations" RENAME COLUMN "roommate_request_id" TO "listing_id";--> statement-breakpoint
ALTER INDEX "worker"."roommate_requests_property_id_idx" RENAME TO "listings_property_id_idx";--> statement-breakpoint
ALTER INDEX "worker"."conversations_sub_roommate_request_idx" RENAME TO "conversations_sub_listing_idx";--> statement-breakpoint
ALTER INDEX "worker"."conversations_one_active_per_user_request" RENAME TO "conversations_one_active_per_user_listing";
