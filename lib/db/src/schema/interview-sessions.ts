import { pgTable, serial, integer, text, timestamp, jsonb } from "drizzle-orm/pg-core";

export type InterviewMessage = {
  role: "interviewer" | "candidate";
  content: string;
  timestamp: string;
};

export type InterviewFeedback = {
  overallScore: number;
  communicationScore: number;
  technicalDepthScore: number;
  summary: string;
  keyStrengths: string[];
  growthAreas: string[];
};

export const interviewSessionsTable = pgTable("interview_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  track: text("track").notNull(),
  type: text("type").notNull(), // "behavioral" | "system_design" | "coding"
  level: text("level").notNull(), // "junior" | "mid" | "senior" | "staff"
  questionCount: integer("question_count").notNull().default(0),
  maxQuestions: integer("max_questions").notNull().default(5),
  status: text("status").notNull().default("active"), // "active" | "completed"
  transcript: jsonb("transcript").$type<InterviewMessage[]>(),
  feedback: jsonb("feedback").$type<InterviewFeedback>(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type InterviewSession = typeof interviewSessionsTable.$inferSelect;
export type InsertInterviewSession = typeof interviewSessionsTable.$inferInsert;
