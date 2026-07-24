import { Router } from "express";
import { db } from "@workspace/db";
import {
  githubReportsTable,
  portfolioReportsTable,
  resumeReportsTable,
  roadmapsTable,
  milestonesTable,
  journalEntriesTable,
  mentorSessionsTable,
  goalsTable,
} from "@workspace/db";
import { eq, desc, and, gte } from "drizzle-orm";
import { requireAuth, type AuthenticatedRequest } from "../middlewares/auth";

import { calculateJournalStreak } from "../lib/streak";

const router = Router();

// GET /api/dashboard/summary
router.get("/summary", requireAuth, async (req, res) => {
  const { user } = req as AuthenticatedRequest;
  const userId = user.id;

  // Fetch all data in parallel
  const [
    githubReports,
    portfolioReports,
    resumeReports,
    roadmap,
    goals,
    journalEntries,
    mentorSessions,
  ] = await Promise.all([
    db.select().from(githubReportsTable).where(eq(githubReportsTable.userId, userId)).orderBy(desc(githubReportsTable.createdAt)).limit(1),
    db.select().from(portfolioReportsTable).where(eq(portfolioReportsTable.userId, userId)).orderBy(desc(portfolioReportsTable.createdAt)).limit(1),
    db.select().from(resumeReportsTable).where(eq(resumeReportsTable.userId, userId)).orderBy(desc(resumeReportsTable.createdAt)).limit(1),
    db.select().from(roadmapsTable).where(eq(roadmapsTable.userId, userId)).limit(1),
    db.select().from(goalsTable).where(eq(goalsTable.userId, userId)),
    db.select().from(journalEntriesTable).where(eq(journalEntriesTable.userId, userId)).orderBy(desc(journalEntriesTable.weekOf)).limit(10),
    db.select().from(mentorSessionsTable).where(eq(mentorSessionsTable.userId, userId)),
  ]);

  const latestGithub = githubReports[0];
  const latestPortfolio = portfolioReports[0];
  const latestResume = resumeReports[0];
  const currentRoadmap = roadmap[0];

  // Engineering score: average of completed analysis scores
  const scores: number[] = [];
  if (latestGithub?.overallScore) scores.push(latestGithub.overallScore);
  if (latestPortfolio?.overallScore) scores.push(latestPortfolio.overallScore);
  if (latestResume?.overallScore) scores.push(latestResume.overallScore);
  const engineeringScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : undefined;

  // Roadmap progress
  let roadmapProgress: number | undefined;
  if (currentRoadmap) {
    const milestones = await db.select().from(milestonesTable).where(eq(milestonesTable.roadmapId, currentRoadmap.id));
    if (milestones.length > 0) {
      roadmapProgress = Math.round((milestones.filter((m) => m.completed).length / milestones.length) * 100);
    }
  }

  // Goals
  const activeGoals = goals.filter((g) => g.status === "active").length;
  const completedGoals = goals.filter((g) => g.status === "completed").length;

  // Journal streak: count consecutive weeks with entries
  const journalStreak = calculateJournalStreak(journalEntries);

  // Collect recent insights from all reports
  const recentInsights: string[] = [];
  if (latestGithub?.recommendations) recentInsights.push(...(latestGithub.recommendations as string[]).slice(0, 2));
  if (latestPortfolio?.recommendations) recentInsights.push(...(latestPortfolio.recommendations as string[]).slice(0, 1));
  if (latestResume?.weaknesses) recentInsights.push(...(latestResume.weaknesses as string[]).slice(0, 1));

  // Top skill gaps from GitHub analysis
  const topSkillGaps: string[] = latestGithub?.growthAreas ? (latestGithub.growthAreas as string[]).slice(0, 4) : [];

  // Current standing band based on latest snapshot score
  let currentStandingBand: "excellent" | "good" | "needs_work" | "critical" | "new" = "new";
  if (scores.length > 0) {
    const hasAllAnalyses = latestGithub && latestPortfolio && latestResume;
    if (!hasAllAnalyses) currentStandingBand = "good";
    else if ((engineeringScore ?? 0) >= 80) currentStandingBand = "excellent";
    else if ((engineeringScore ?? 0) >= 60) currentStandingBand = "good";
    else if ((engineeringScore ?? 0) >= 40) currentStandingBand = "needs_work";
    else currentStandingBand = "critical";
  }

  // Next action suggestion
  let nextAction: string | undefined;
  if (!latestGithub) nextAction = "Analyze your GitHub profile to get your engineering DNA score";
  else if (!latestPortfolio) nextAction = "Analyze your portfolio website for a comprehensive assessment";
  else if (!latestResume) nextAction = "Get your resume analyzed to identify gaps and improvements";
  else if (!currentRoadmap) nextAction = "Generate your personalized engineering roadmap";
  else if (activeGoals === 0) nextAction = "Set your first growth goal to start tracking progress";
  else if (journalEntries.length === 0) nextAction = "Start your weekly growth journal";

  res.json(
    JSON.parse(
      JSON.stringify({
        user,
        engineeringScore,
        githubAnalyzed: !!latestGithub && latestGithub.status === "completed",
        portfolioAnalyzed: !!latestPortfolio && latestPortfolio.status === "completed",
        resumeAnalyzed: !!latestResume && latestResume.status === "completed",
        hasRoadmap: !!currentRoadmap,
        roadmapProgress,
        activeGoals,
        completedGoals,
        journalStreak,
        mentorSessions: mentorSessions.length,
        recentInsights: recentInsights.slice(0, 4),
        weeklyFocus: currentRoadmap?.weeklyGoal ?? undefined,
        topSkillGaps,
        nextAction,
        currentStandingBand,
      }),
    ),
  );
});

export default router;
