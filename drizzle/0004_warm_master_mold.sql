ALTER TABLE "users" ADD COLUMN "google_sub" varchar(255);--> statement-breakpoint
CREATE UNIQUE INDEX "users_google_sub_unique" ON "users" USING btree ("google_sub");