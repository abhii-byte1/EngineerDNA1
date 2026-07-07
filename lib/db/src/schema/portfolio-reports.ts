import { pgTable, serial, text, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import type { AnalysisInsight } from "./github-reports";

export const portfolioReportsTable = pgTable("portfolio_reports", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  portfolioUrl: text("portfolio_url").notNull(),
  status: text("status").notNull().default("pending"),
  overallScore: integer("overall_score"),
  performanceScore: integer("performance_score"),
  accessibilityScore: integer("accessibility_score"),
  seoScore: integer("seo_score"),
  uiScore: integer("ui_score"),
  strengths: jsonb("strengths").$type<string[]>(),
  weaknesses: jsonb("weaknesses").$type<string[]>(),
  insights: jsonb("insights").$type<AnalysisInsight[]>(),
  recommendations: jsonb("recommendations").$type<string[]>(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type PortfolioReport = typeof portfolioReportsTable.$inferSelect;
export type InsertPortfolioReport = typeof portfolioReportsTable.$inferInsert;
