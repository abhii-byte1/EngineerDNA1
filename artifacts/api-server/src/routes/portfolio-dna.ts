import { Router } from "express";
import { db } from "@workspace/db";
import { portfolioReportsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth, type AuthenticatedRequest } from "../middlewares/auth";
import { gemini } from "../lib/ai";

const router = Router();

// POST /api/portfolio-dna/analyze
router.post("/analyze", requireAuth, async (req, res) => {
  const { user } = req as AuthenticatedRequest;
  const { portfolioUrl } = req.body as { portfolioUrl: string };

  if (!portfolioUrl?.trim()) {
    res.status(400).json({ error: "portfolioUrl is required" });
    return;
  }

  const [report] = await db
    .insert(portfolioReportsTable)
    .values({ userId: user.id, portfolioUrl: portfolioUrl.trim(), status: "analyzing" })
    .returning();

  try {
    // Fetch portfolio page content for analysis
    let pageContent = "";
    try {
      const pageRes = await fetch(portfolioUrl, {
        headers: { "User-Agent": "Mozilla/5.0 EngineerDNA/1.0" },
        signal: AbortSignal.timeout(10000),
      });
      pageContent = await pageRes.text();
      // Truncate to avoid token limits
      pageContent = pageContent.slice(0, 8000);
    } catch {
      pageContent = "(Unable to fetch portfolio content — analyzing URL only)";
    }

    const response = await gemini.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Analyze this portfolio website and return a JSON assessment.

URL: ${portfolioUrl}
Page Content (first 8000 chars): ${pageContent}

Return ONLY valid JSON:
{
  "overallScore": <0-100>,
  "performanceScore": <0-100>,
  "accessibilityScore": <0-100>,
  "seoScore": <0-100>,
  "uiScore": <0-100>,
  "strengths": [<3-5 specific strengths>],
  "weaknesses": [<3-5 specific weaknesses>],
  "recommendations": [<4-6 actionable improvements>],
  "insights": [
    {
      "observation": "<what you observed>",
      "evidence": "<specific evidence>",
      "reason": "<why it matters>",
      "impact": "<career/growth impact>",
      "actionPlan": "<concrete steps>",
      "priority": "<critical|high|medium|low>",
      "estimatedImprovement": "<expected improvement>"
    }
  ]
}`,
      config: {
        responseMimeType: "application/json",
        systemInstruction: "You are an expert web developer and UX/performance analyst. You evaluate engineering portfolios on performance, accessibility, SEO, and UI/UX quality.",
      },
    });

    const analysis = JSON.parse(response.text ?? "{}") as Record<string, unknown>;

    const [updated] = await db
      .update(portfolioReportsTable)
      .set({
        status: "completed",
        overallScore: analysis.overallScore as number,
        performanceScore: analysis.performanceScore as number,
        accessibilityScore: analysis.accessibilityScore as number,
        seoScore: analysis.seoScore as number,
        uiScore: analysis.uiScore as number,
        strengths: (analysis.strengths as string[]) ?? [],
        weaknesses: (analysis.weaknesses as string[]) ?? [],
        insights: (analysis.insights as import("../../../../lib/db/src/schema/github-reports").AnalysisInsight[]) ?? [],
        recommendations: (analysis.recommendations as string[]) ?? [],
      })
      .where(eq(portfolioReportsTable.id, report.id))
      .returning();

    res.json(JSON.parse(JSON.stringify(updated)));
  } catch (err) {
    console.error("[portfolio-dna] analysis error:", err);
    await db.update(portfolioReportsTable).set({ status: "failed" }).where(eq(portfolioReportsTable.id, report.id));
    res.status(500).json({ error: "Analysis failed", details: err instanceof Error ? err.message : String(err) });
  }
});

// GET /api/portfolio-dna/reports
router.get("/reports", requireAuth, async (req, res) => {
  const { user } = req as AuthenticatedRequest;
  const reports = await db
    .select()
    .from(portfolioReportsTable)
    .where(eq(portfolioReportsTable.userId, user.id))
    .orderBy(desc(portfolioReportsTable.createdAt));
  res.json(JSON.parse(JSON.stringify(reports)));
});

// GET /api/portfolio-dna/reports/:id
router.get("/reports/:id", requireAuth, async (req, res) => {
  const { user } = req as AuthenticatedRequest;
  const id = parseInt(req.params.id as string, 10);
  const [report] = await db.select().from(portfolioReportsTable).where(eq(portfolioReportsTable.id, id)).limit(1);
  if (!report || report.userId !== user.id) {
    res.status(404).json({ error: "Report not found" });
    return;
  }
  res.json(JSON.parse(JSON.stringify(report)));
});

export default router;
