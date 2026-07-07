import { pgTable, serial, text, integer, date, timestamp } from "drizzle-orm/pg-core";

export const journalEntriesTable = pgTable("journal_entries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  weekOf: date("week_of").notNull(),
  learnings: text("learnings").notNull().default(""),
  achievements: text("achievements").notNull().default(""),
  mistakes: text("mistakes").notNull().default(""),
  lessons: text("lessons").notNull().default(""),
  mood: text("mood").notNull().default("okay"),
  aiInsights: text("ai_insights"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type JournalEntry = typeof journalEntriesTable.$inferSelect;
export type InsertJournalEntry = typeof journalEntriesTable.$inferInsert;
