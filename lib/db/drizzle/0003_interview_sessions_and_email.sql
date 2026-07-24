CREATE TABLE IF NOT EXISTS "interview_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"track" text NOT NULL,
	"type" text NOT NULL,
	"level" text NOT NULL,
	"question_count" integer DEFAULT 0 NOT NULL,
	"max_questions" integer DEFAULT 5 NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"transcript" jsonb,
	"feedback" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "email_notifications_opt_in" boolean DEFAULT true NOT NULL;
