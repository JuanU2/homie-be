CREATE TABLE "worker"."conversations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"roommate_request_id" uuid NOT NULL,
	"sub" varchar(255) NOT NULL,
	"status" varchar(32) DEFAULT 'ACTIVE' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "worker"."messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversation_id" uuid NOT NULL,
	"content" jsonb NOT NULL,
	"role" varchar(32) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "worker"."messages" ADD CONSTRAINT "messages_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "worker"."conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "conversations_sub_roommate_request_idx" ON "worker"."conversations" USING btree ("sub","roommate_request_id");--> statement-breakpoint
CREATE UNIQUE INDEX "conversations_one_active_per_user_request" ON "worker"."conversations" USING btree ("sub","roommate_request_id") WHERE "worker"."conversations"."status" = 'ACTIVE';--> statement-breakpoint
CREATE INDEX "messages_conversation_id_idx" ON "worker"."messages" USING btree ("conversation_id");