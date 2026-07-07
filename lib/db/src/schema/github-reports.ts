import { pgTable, serial, text, integer, timestamp, jsonb } from "drizzle-orm/pg-core";

export type AnalysisInsight = {
  observation: string;
  evidence: string;
  reason: string;
  impact: string;
  actionPlan: string;
  priority: "critical" | "high" | "medium" | "low";
  estimatedImprovement: string;
};

export const githubReportsTable = pgTable("github_reports", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  githubUsername: text("github_username").notNull(),
  status: text("status").notNull().default("pending"),
  overallScore: integer("overall_score"),
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
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type GithubReport = typeof githubReportsTable.$inferSelect;
export type InsertGithubReport = typeof githubReportsTable.$inferInsert;
