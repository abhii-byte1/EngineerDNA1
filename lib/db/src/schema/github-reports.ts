import { pgTable, serial, text, integer, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";

export type AnalysisInsight = {
  observation: string;
  evidence: string;
  reason: string;
  impact: string;
  actionPlan: string;
  priority: "critical" | "high" | "medium" | "low";
  estimatedImprovement: string;
};

export const DEVELOPER_ARCHETYPES = [
  "night_owl_architect",
  "speedrun_scripter",
  "documentation_guardian",
  "open_source_nomad",
  "full_stack_chameleon",
  "refactoring_monk",
  "test_driven_fanatic",
  "devops_magician",
  "algorithm_artisan",
] as const;

export type DeveloperArchetype = typeof DEVELOPER_ARCHETYPES[number];

export const githubReportsTable = pgTable("github_reports", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"), // Nullable for unauthenticated roast snapshots if ever cached in DB, otherwise user ID
  githubUsername: text("github_username").notNull(),
  status: text("status").notNull().default("pending"),
  overallScore: integer("overall_score"),
  archetype: text("archetype"), // enum string from DEVELOPER_ARCHETYPES
  archetypeDescription: text("archetype_description"),
  headlineStrengths: jsonb("headline_strengths").$type<string[]>(),
  strengths: jsonb("strengths").$type<string[]>(),
  weaknesses: jsonb("weaknesses").$type<string[]>(),
  techStack: jsonb("tech_stack").$type<string[]>(),
  totalRepositories: integer("total_repositories"),
  totalCommits: integer("total_commits"),
  topLanguages: jsonb("top_languages").$type<string[]>(),
  insights: jsonb("insights").$type<AnalysisInsight[]>(),
  architectureIssues: jsonb("architecture_issues").$type<string[]>(),
  recommendations: jsonb("recommendations").$type<string[]>(),
  growthAreas: jsonb("growth_areas").$type<string[]>(),
  isPublic: boolean("is_public").notNull().default(false),
  isPublicUpdatedAt: timestamp("is_public_updated_at", { withTimezone: true }),
  leaderboardOptIn: boolean("leaderboard_opt_in").notNull().default(false),
  track: text("track"),
  level: text("level"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type GithubReport = typeof githubReportsTable.$inferSelect;
export type InsertGithubReport = typeof githubReportsTable.$inferInsert;
