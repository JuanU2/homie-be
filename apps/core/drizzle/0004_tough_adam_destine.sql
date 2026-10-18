CREATE TABLE "core"."favourites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"roommate_request_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "core"."favourites" ADD CONSTRAINT "favourites_roommate_request_id_roommate_requests_id_fk" FOREIGN KEY ("roommate_request_id") REFERENCES "core"."roommate_requests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core"."favourites" ADD CONSTRAINT "favourites_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "core"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "favourites_user_roommate_request_unique" ON "core"."favourites" USING btree ("user_id","roommate_request_id");