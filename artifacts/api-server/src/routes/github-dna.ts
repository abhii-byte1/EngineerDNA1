import { Router } from "express";
import { z } from "zod";
import { db, githubReportsTable, getScorePercentile } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth, type AuthenticatedRequest } from "../middlewares/auth";
import { aiLimiter } from "../lib/rate-limiters";
import { analyzeGitHubProfile } from "../lib/github-analysis";

const router = Router();

// ── Zod Schemas ───────────────────────────────────────────────────────────────
const analyzeSchema = z.object({
  githubUsername: z
    .string()
    .min(1, "githubUsername is required")
    .max(39, "GitHub username cannot exceed 39 characters")
    .regex(/^[a-zA-Z0-9-]+$/, "Invalid GitHub username format"),
});

const updateVisibilitySchema = z.object({
  isPublic: z.boolean().optional(),
  leaderboardOptIn: z.boolean().optional(),
});

// POST /api/github-dna/analyze
router.post("/analyze", requireAuth, ...aiLimiter, async (req, res) => {
  const { user } = req as AuthenticatedRequest;

  const parsed = analyzeSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input", details: parsed.error.flatten().fieldErrors });
    return;
  }

  const { githubUsername } = parsed.data;

  // Insert initial pending record
  const [reportRow] = await db
    .insert(githubReportsTable)
    .values({
      userId: user.id,
      githubUsername,
      status: "analyzing",
      isPublic: false,
    })
    .returning();

  try {
    const analysis = await analyzeGitHubProfile(githubUsername, "coach");

    const [updated] = await db
      .update(githubReportsTable)
      .set({
        status: "completed",
        overallScore: analysis.overallScore,
        archetype: analysis.archetype,
        archetypeDescription: analysis.archetypeDescription,
        headlineStrengths: analysis.headlineStrengths,
        strengths: analysis.strengths,
        weaknesses: analysis.weaknesses,
        techStack: analysis.techStack,
        totalRepositories: analysis.totalRepositories,
        topLanguages: analysis.topLanguages,
        insights: analysis.insights,
        architectureIssues: analysis.architectureIssues,
        recommendations: analysis.recommendations,
        growthAreas: analysis.growthAreas,
        track: user.primaryTrack || "Full Stack",
        level: user.experienceLevel || "mid",
      })
      .where(eq(githubReportsTable.id, reportRow.id))
      .returning();

    const { percentile, cohortSize } = await getScorePercentile(db, analysis.overallScore, updated.track || undefined);

    res.json(
      JSON.parse(
        JSON.stringify({
          ...updated,
          percentile,
          cohortSize,
        })
      )
    );
  } catch (err) {
    console.error("[github-dna] analysis error:", err);
    await db.update(githubReportsTable).set({ status: "failed" }).where(eq(githubReportsTable.id, reportRow.id));
    const errorMsg = err instanceof Error ? err.message : "Analysis failed. Please try again.";
    if (errorMsg === "GitHub user not found") {
      res.status(404).json({ error: errorMsg });
    } else {
      res.status(500).json({ error: errorMsg });
    }
  }
});

// GET /api/github-dna/reports
router.get("/reports", requireAuth, async (req, res) => {
  const { user } = req as AuthenticatedRequest;
  const reports = await db
    .select()
    .from(githubReportsTable)
    .where(eq(githubReportsTable.userId, user.id))
    .orderBy(desc(githubReportsTable.createdAt));

  const enriched = await Promise.all(
    reports.map(async (r) => {
      if (r.status === "completed" && r.overallScore !== null) {
        const { percentile, cohortSize } = await getScorePercentile(db, r.overallScore, r.track || undefined);
        return { ...r, percentile, cohortSize };
      }
      return r;
    })
  );

  res.json(JSON.parse(JSON.stringify(enriched)));
});

// GET /api/github-dna/reports/:id
router.get("/reports/:id", requireAuth, async (req, res) => {
  const { user } = req as AuthenticatedRequest;
  const id = parseInt(req.params.id as string, 10);
  const [report] = await db.select().from(githubReportsTable).where(eq(githubReportsTable.id, id)).limit(1);

  if (!report || report.userId !== user.id) {
    res.status(404).json({ error: "Report not found" });
    return;
  }

  let percentile = null;
  let cohortSize = 0;
  if (report.status === "completed" && report.overallScore !== null) {
    const p = await getScorePercentile(db, report.overallScore, report.track || undefined);
    percentile = p.percentile;
    cohortSize = p.cohortSize;
  }

  res.json(JSON.parse(JSON.stringify({ ...report, percentile, cohortSize })));
});

// PATCH /api/github-dna/reports/:id/visibility (Opt-in / Opt-out for public scorecard and leaderboard)
router.patch("/reports/:id/visibility", requireAuth, async (req, res) => {
  const { user } = req as AuthenticatedRequest;
  const id = parseInt(req.params.id as string, 10);

  const parsed = updateVisibilitySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input", details: parsed.error.flatten().fieldErrors });
    return;
  }

  const [report] = await db.select().from(githubReportsTable).where(eq(githubReportsTable.id, id)).limit(1);
  if (!report || report.userId !== user.id) {
    res.status(404).json({ error: "Report not found" });
    return;
  }

  const updates: Record<string, unknown> = {};
  if (parsed.data.isPublic !== undefined) {
    updates.isPublic = parsed.data.isPublic;
    updates.isPublicUpdatedAt = new Date();
  }
  if (parsed.data.leaderboardOptIn !== undefined) {
    updates.leaderboardOptIn = parsed.data.leaderboardOptIn;
  }

  const [updated] = await db
    .update(githubReportsTable)
    .set(updates)
    .where(eq(githubReportsTable.id, id))
    .returning();

  res.json(JSON.parse(JSON.stringify(updated)));
});

// DELETE /api/github-dna/reports/:id
router.delete("/reports/:id", requireAuth, async (req, res) => {
  const { user } = req as AuthenticatedRequest;
  const id = parseInt(req.params.id as string, 10);
  const [report] = await db.select().from(githubReportsTable).where(eq(githubReportsTable.id, id)).limit(1);

  if (!report || report.userId !== user.id) {
    res.status(404).json({ error: "Report not found" });
    return;
  }

  await db.delete(githubReportsTable).where(eq(githubReportsTable.id, id));
  res.json({ message: "Report deleted" });
});

export default router;
