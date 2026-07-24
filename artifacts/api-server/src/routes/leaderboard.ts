import { Router } from "express";
import { db, githubReportsTable, getScorePercentile } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { publicLimiter } from "../lib/rate-limiters";

const router = Router();

// GET /api/leaderboard?track=Full%20Stack&level=mid
router.get("/", publicLimiter, async (req, res) => {
  const track = typeof req.query.track === "string" && req.query.track ? req.query.track : undefined;
  const level = typeof req.query.level === "string" && req.query.level ? req.query.level : undefined;

  const conditions = [
    eq(githubReportsTable.status, "completed"),
    eq(githubReportsTable.isPublic, true),
    eq(githubReportsTable.leaderboardOptIn, true),
  ];

  if (track) conditions.push(eq(githubReportsTable.track, track));
  if (level) conditions.push(eq(githubReportsTable.level, level));

  const reports = await db
    .select()
    .from(githubReportsTable)
    .where(and(...conditions))
    .orderBy(desc(githubReportsTable.overallScore))
    .limit(50);

  const leaderboard = await Promise.all(
    reports.map(async (r) => {
      const { percentile, cohortSize } = await getScorePercentile(
        db,
        r.overallScore ?? 0,
        r.track || undefined
      );

      return {
        id: r.id,
        githubUsername: r.githubUsername,
        overallScore: r.overallScore,
        archetype: r.archetype,
        archetypeDescription: r.archetypeDescription,
        topLanguages: r.topLanguages,
        track: r.track || "Full Stack",
        level: r.level || "mid",
        percentile,
        cohortSize,
      };
    })
  );

  res.json(leaderboard);
});

export default router;
