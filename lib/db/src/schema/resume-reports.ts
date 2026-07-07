import { pgTable, serial, text, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import type { AnalysisInsight } from "./github-reports";

export const resumeReportsTable = pgTable("resume_reports", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  fileName: text("file_name"),
  resumeText: text("resume_text").notNull(),
  targetRole: text("target_role"),
  status: text("status").notNull().default("pending"),
  overallScore: integer("overall_score"),
  writingQualityScore: integer("writing_quality_score"),
  technicalAccuracyScore: integer("technical_accuracy_score"),
  impactScore: integer("impact_score"),
  strengths: jsonb("strengths").$type<string[]>(),
  weaknesses: jsonb("weaknesses").$type<string[]>(),
  missingSkills: jsonb("missing_skills").$type<string[]>(),
  weakClaims: jsonb("weak_claims").$type<string[]>(),
  improvedBullets: jsonb("improved_bullets").$type<string[]>(),
  insights: jsonb("insights").$type<AnalysisInsight[]>(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type ResumeReport = typeof resumeReportsTable.$inferSelect;
export type InsertResumeReport = typeof resumeReportsTable.$inferInsert;
