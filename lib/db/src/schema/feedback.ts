import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";

export const feedbackTable = pgTable("feedback", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  context: text("context").notNull(), // e.g. "roast_result" | "scorecard" | "dashboard"
  contextId: text("context_id"), // e.g. report id or username
  rating: text("rating"), // "up" | "down"
  comment: text("comment"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Feedback = typeof feedbackTable.$inferSelect;
export type InsertFeedback = typeof feedbackTable.$inferInsert;
