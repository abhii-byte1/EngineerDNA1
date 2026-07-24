import { Router } from "express";
import { z } from "zod";
import { db } from "@workspace/db";
import { githubReportsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth, type AuthenticatedRequest } from "../middlewares/auth";
import { aiLimiter } from "../lib/rate-limiters";
import { runAnalysis } from "../lib/run-analysis";

const router = Router();

// ── Zod Schemas ───────────────────────────────────────────────────────────────
// GitHub usernames: 1-39 chars, alphanumeric + hyphens only
const analyzeSchema = z.object({
  githubUsername: z
    .string()
    .min(1, "githubUsername is required")
    .max(39, "GitHub username cannot exceed 39 characters")
    .regex(/^[a-zA-Z0-9-]+$/, "Invalid GitHub username format"),
});

// POST /api/github-dna/analyze
router.post("/analyze", requireAuth, aiLimiter, async (req, res) => {
  const { user } = req as AuthenticatedRequest;

  // FIX: Validate input with Zod
  const parsed = analyzeSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input", details: parsed.error.flatten().fieldErrors });
    return;
  }

  const { githubUsername } = parsed.data;

  try {
    const { row: updated } = await runAnalysis({
      table: githubReportsTable,
      insertValues: { userId: user.id, githubUsername, status: "analyzing" },
      buildPrompt: async () => {
        const [userRes, reposRes] = await Promise.all([
          fetch(`https://api.github.com/users/${githubUsername}`, { headers: { "User-Agent": "EngineerDNA/1.0" } }),
          fetch(`https://api.github.com/users/${githubUsername}/repos?per_page=50&sort=updated`, { headers: { "User-Agent": "EngineerDNA/1.0" } }),
        ]);

        if (!userRes.ok) {
          throw new Error("GitHub user not found");
        }

        const ghUser = (await userRes.json()) as Record<string, unknown>;
        const repos = (reposRes.ok ? await reposRes.json() : []) as Record<string, unknown>[];

        const repoSummary = repos.slice(0, 25).map((r) => ({
          name: r.name,
          language: r.language,
          stars: r.stargazers_count,
          forked: r.fork,
          description: r.description,
          topics: r.topics,
          size: r.size,
          updated: r.updated_at,
        }));

        const langCounts: Record<string, number> = {};
        for (const r of repos) {
          if (r.language) langCounts[r.language as string] = (langCounts[r.language as string] ?? 0) + 1;
        }
        const topLanguages = Object.entries(langCounts).sort((a, b) => b[1] - a[1]).map(([l]) => l).slice(0, 10);

        const promptText = `Analyze this GitHub profile and return a JSON engineering assessment.

GitHub Profile: ${JSON.stringify(ghUser)}
Repositories (most recent 25): ${JSON.stringify(repoSummary)}
Top Languages: ${topLanguages.join(", ")}

Return ONLY valid JSON with this exact structure:
{
  "overallScore": <0-100 integer>,
  "strengths": [<3-6 specific strengths>],
  "weaknesses": [<3-6 specific weaknesses or gaps>],
  "techStack": [<detected tech stack items>],
  "architectureIssues": [<2-5 architecture/code quality concerns>],
  "recommendations": [<4-6 actionable specific recommendations>],
  "growthAreas": [<3-5 high-impact growth opportunities>],
  "insights": [
    {
      "observation": "<what you observed>",
      "evidence": "<specific evidence from repos>",
      "reason": "<why this matters for career growth>",
      "impact": "<impact if unaddressed>",
      "actionPlan": "<concrete steps to fix>",
      "priority": "<critical|high|medium|low>",
      "estimatedImprovement": "<expected improvement if addressed>"
    }
  ]
}`;
        return { prompt: promptText, context: { totalRepositories: ghUser.public_repos } };
      },
      systemInstruction: "You are a brutally honest, expert engineering career coach. You analyze GitHub profiles with surgical precision to identify strengths, weaknesses, and growth opportunities. Be specific — reference actual repo names, languages, and patterns. Never be generic.",
      mapResult: (analysis, context) => ({
        status: "completed",
        overallScore: analysis.overallScore as number,
        strengths: (analysis.strengths as string[]) ?? [],
        weaknesses: (analysis.weaknesses as string[]) ?? [],
        techStack: (analysis.techStack as string[]) ?? [],
        totalRepositories: (context?.totalRepositories as number) ?? 0,
        topLanguages: (analysis.techStack as string[])?.slice(0,10) ?? [],
        insights: (analysis.insights as import("../../../../lib/db/src/schema/github-reports").AnalysisInsight[]) ?? [],
        architectureIssues: (analysis.architectureIssues as string[]) ?? [],
        recommendations: (analysis.recommendations as string[]) ?? [],
        growthAreas: (analysis.growthAreas as string[]) ?? [],
      }),
    });

    res.json(JSON.parse(JSON.stringify(updated)));
  } catch (err) {
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
  res.json(JSON.parse(JSON.stringify(reports)));
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
  res.json(JSON.parse(JSON.stringify(report)));
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
