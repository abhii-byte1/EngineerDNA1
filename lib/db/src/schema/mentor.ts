import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";

export const mentorSessionsTable = pgTable("mentor_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  topic: text("topic").notNull(),
  messageCount: integer("message_count").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const mentorMessagesTable = pgTable("mentor_messages", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull(),
  role: text("role").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type MentorSession = typeof mentorSessionsTable.$inferSelect;
export type InsertMentorSession = typeof mentorSessionsTable.$inferInsert;
export type MentorMessage = typeof mentorMessagesTable.$inferSelect;
export type InsertMentorMessage = typeof mentorMessagesTable.$inferInsert;
