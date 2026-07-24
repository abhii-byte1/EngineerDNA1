ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "role" text DEFAULT 'user' NOT NULL;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "last_active_at" timestamp with time zone;

CREATE TABLE IF NOT EXISTS "admin_audit_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"admin_user_id" integer NOT NULL,
	"action" text NOT NULL,
	"target_user_id" integer,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "feedback" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"context" text NOT NULL,
	"context_id" text,
	"rating" text,
	"comment" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
