import { Router } from "express";
import { db, githubReportsTable, getScorePercentile } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { publicLimiter } from "../lib/rate-limiters";

const router = Router();

// GET /api/public/:username
router.get("/:username", publicLimiter, async (req, res) => {
  const username = (req.params.username as string).trim().toLowerCase();

  // Find the latest completed report for this username
  const reports = await db
    .select()
    .from(githubReportsTable)
    .where(
      and(
        eq(githubReportsTable.githubUsername, username),
        eq(githubReportsTable.status, "completed")
      )
    )
    .orderBy(desc(githubReportsTable.createdAt))
    .limit(1);

  const report = reports[0];

  // CRITICAL SECURITY REQUIREMENT: Must check isPublic === true server-side
  // and return 404 (not 403) if false or not found — never confirm account existence.
  if (!report || !report.isPublic) {
    res.status(404).json({ error: "Public profile not found" });
    return;
  }

  // Calculate real SQL percentile
  const { percentile, cohortSize } = await getScorePercentile(
    db,
    report.overallScore ?? 0,
    report.track || undefined
  );

  // Return public-safe fields only
  res.json({
    githubUsername: report.githubUsername,
    overallScore: report.overallScore,
    archetype: report.archetype,
    archetypeDescription: report.archetypeDescription,
    headlineStrengths: report.headlineStrengths ?? report.strengths?.slice(0, 3) ?? [],
    topLanguages: report.topLanguages ?? [],
    techStack: report.techStack?.slice(0, 8) ?? [],
    percentile,
    cohortSize,
    updatedAt: report.createdAt,
  });
});

export default router;
