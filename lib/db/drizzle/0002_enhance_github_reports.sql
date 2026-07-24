ALTER TABLE "github_reports" ADD COLUMN IF NOT EXISTS "archetype" text;
ALTER TABLE "github_reports" ADD COLUMN IF NOT EXISTS "archetype_description" text;
ALTER TABLE "github_reports" ADD COLUMN IF NOT EXISTS "headline_strengths" jsonb;
ALTER TABLE "github_reports" ADD COLUMN IF NOT EXISTS "is_public" boolean DEFAULT false NOT NULL;
ALTER TABLE "github_reports" ADD COLUMN IF NOT EXISTS "is_public_updated_at" timestamp with time zone;
ALTER TABLE "github_reports" ADD COLUMN IF NOT EXISTS "leaderboard_opt_in" boolean DEFAULT false NOT NULL;
ALTER TABLE "github_reports" ADD COLUMN IF NOT EXISTS "track" text;
ALTER TABLE "github_reports" ADD COLUMN IF NOT EXISTS "level" text;
ALTER TABLE "github_reports" ALTER COLUMN "user_id" DROP NOT NULL;
