CREATE TABLE "worker"."ai_usage" (
	"sub" varchar(255) NOT NULL,
	"feature" varchar(32) NOT NULL,
	"day" date NOT NULL,
	"count" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "ai_usage_sub_feature_day_pk" PRIMARY KEY("sub","feature","day")
);
