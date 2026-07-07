import { pgTable, serial, text, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";

export const roadmapsTable = pgTable("roadmaps", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(),
  track: text("track").notNull(),
  targetRole: text("target_role").notNull(),
  currentLevel: text("current_level").notNull(),
  estimatedWeeks: integer("estimated_weeks"),
  weeklyGoal: text("weekly_goal"),
  monthlyGoal: text("monthly_goal"),
  recommendedProjects: jsonb("recommended_projects").$type<string[]>(),
  recommendedCourses: jsonb("recommended_courses").$type<string[]>(),
  recommendedBooks: jsonb("recommended_books").$type<string[]>(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const milestonesTable = pgTable("milestones", {
  id: serial("id").primaryKey(),
  roadmapId: integer("roadmap_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  weekNumber: integer("week_number").notNull(),
  completed: boolean("completed").notNull().default(false),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  skills: jsonb("skills").$type<string[]>(),
  tasks: jsonb("tasks").$type<string[]>(),
});

export type Roadmap = typeof roadmapsTable.$inferSelect;
export type InsertRoadmap = typeof roadmapsTable.$inferInsert;
export type Milestone = typeof milestonesTable.$inferSelect;
export type InsertMilestone = typeof milestonesTable.$inferInsert;
