CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text,
	"name" text DEFAULT '' NOT NULL,
	"avatar_url" text,
	"github_username" text,
	"github_id" text,
	"bio" text,
	"target_role" text,
	"experience_level" text,
	"primary_track" text,
	"years_of_experience" integer,
	"skills" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_github_id_unique" UNIQUE("github_id")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sessions_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "github_reports" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"github_username" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"overall_score" integer,
	"strengths" jsonb,
	"weaknesses" jsonb,
	"tech_stack" jsonb,
	"total_repositories" integer,
	"total_commits" integer,
	"top_languages" jsonb,
	"insights" jsonb,
	"architecture_issues" jsonb,
	"recommendations" jsonb,
	"growth_areas" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "portfolio_reports" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"portfolio_url" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"overall_score" integer,
	"performance_score" integer,
	"accessibility_score" integer,
	"seo_score" integer,
	"ui_score" integer,
	"strengths" jsonb,
	"weaknesses" jsonb,
	"insights" jsonb,
	"recommendations" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "resume_reports" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"file_name" text,
	"resume_text" text NOT NULL,
	"target_role" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"overall_score" integer,
	"writing_quality_score" integer,
	"technical_accuracy_score" integer,
	"impact_score" integer,
	"strengths" jsonb,
	"weaknesses" jsonb,
	"missing_skills" jsonb,
	"weak_claims" jsonb,
	"improved_bullets" jsonb,
	"insights" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "milestones" (
	"id" serial PRIMARY KEY NOT NULL,
	"roadmap_id" integer NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"week_number" integer NOT NULL,
	"completed" boolean DEFAULT false NOT NULL,
	"completed_at" timestamp with time zone,
	"skills" jsonb,
	"tasks" jsonb
);
--> statement-breakpoint
CREATE TABLE "roadmaps" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"track" text NOT NULL,
	"target_role" text NOT NULL,
	"current_level" text NOT NULL,
	"estimated_weeks" integer,
	"weekly_goal" text,
	"monthly_goal" text,
	"recommended_projects" jsonb,
	"recommended_courses" jsonb,
	"recommended_books" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "roadmaps_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "journal_entries" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"week_of" date NOT NULL,
	"learnings" text DEFAULT '' NOT NULL,
	"achievements" text DEFAULT '' NOT NULL,
	"mistakes" text DEFAULT '' NOT NULL,
	"lessons" text DEFAULT '' NOT NULL,
	"mood" text DEFAULT 'okay' NOT NULL,
	"ai_insights" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mentor_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" integer NOT NULL,
	"role" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mentor_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"title" text NOT NULL,
	"topic" text NOT NULL,
	"message_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "goals" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"category" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"priority" text DEFAULT 'medium' NOT NULL,
	"target_date" date,
	"completed_at" timestamp with time zone,
	"progress" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
