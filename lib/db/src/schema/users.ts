import { pgTable, serial, text, integer, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email"),
  name: text("name").notNull().default(""),
  avatarUrl: text("avatar_url"),
  githubUsername: text("github_username"),
  githubId: text("github_id").unique(),
  bio: text("bio"),
  targetRole: text("target_role"),
  experienceLevel: text("experience_level"),
  primaryTrack: text("primary_track"),
  yearsOfExperience: integer("years_of_experience"),
  skills: jsonb("skills").$type<string[]>(),
  emailNotificationsOptIn: boolean("email_notifications_opt_in").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type User = typeof usersTable.$inferSelect;
export type InsertUser = typeof usersTable.$inferInsert;
