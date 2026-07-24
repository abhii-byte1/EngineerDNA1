import { Router } from "express";
import { z } from "zod";
import { db } from "@workspace/db";
import { portfolioReportsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth, type AuthenticatedRequest } from "../middlewares/auth";
import { aiLimiter } from "../lib/rate-limiters";
import { runAnalysis } from "../lib/run-analysis";

const router = Router();

// ── SSRF Protection ───────────────────────────────────────────────────────────
// FIX: Block requests to private/internal IP ranges to prevent SSRF attacks
const PRIVATE_IP_PATTERNS = [
  /^localhost$/i,
  /^127\./,
  /^10\./,
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
  /^192\.168\./,
  /^169\.254\./, // Link-local (AWS metadata endpoint)
  /^::1$/,       // IPv6 loopback
  /^fc00:/i,     // IPv6 private
  /^fd[0-9a-f]{2}:/i, // IPv6 private
];

function isSafeUrl(rawUrl: string): { safe: boolean; reason?: string } {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return { safe: false, reason: "Invalid URL format" };
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    return { safe: false, reason: "Only http and https URLs are allowed" };
  }

  const hostname = parsed.hostname.toLowerCase();
  for (const pattern of PRIVATE_IP_PATTERNS) {
    if (pattern.test(hostname)) {
      return { safe: false, reason: "Requests to private/internal network addresses are not allowed" };
    }
  }

  return { safe: true };
}

// ── Zod Schemas ───────────────────────────────────────────────────────────────
const analyzeSchema = z.object({
  portfolioUrl: z
    .string()
    .url("Must be a valid URL")
    .max(500, "URL is too long"),
});

// POST /api/portfolio-dna/analyze
router.post("/analyze", requireAuth, ...aiLimiter, async (req, res) => {
  const { user } = req as AuthenticatedRequest;

  // FIX: Validate URL input with Zod
  const parsed = analyzeSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input", details: parsed.error.flatten().fieldErrors });
    return;
  }

  const { portfolioUrl } = parsed.data;

  // FIX: SSRF protection — block private/internal addresses
  const safeCheck = isSafeUrl(portfolioUrl);
  if (!safeCheck.safe) {
    res.status(400).json({ error: safeCheck.reason ?? "Invalid portfolio URL" });
    return;
  }

  try {
    const { row: updated } = await runAnalysis({
      table: portfolioReportsTable,
      insertValues: { userId: user.id, portfolioUrl, status: "analyzing" },
      buildPrompt: async () => {
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

        return `Analyze this portfolio website and return a JSON assessment.

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
}`;
      },
      systemInstruction: "You are an expert web developer and UX/performance analyst. You evaluate engineering portfolios on performance, accessibility, SEO, and UI/UX quality.",
      mapResult: (analysis) => ({
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
      }),
    });

    res.json(JSON.parse(JSON.stringify(updated)));
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Analysis failed. Please try again.";
    res.status(500).json({ error: errorMsg });
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

// DELETE /api/portfolio-dna/reports/:id
router.delete("/reports/:id", requireAuth, async (req, res) => {
  const { user } = req as AuthenticatedRequest;
  const id = parseInt(req.params.id as string, 10);
  const [report] = await db.select().from(portfolioReportsTable).where(eq(portfolioReportsTable.id, id)).limit(1);
  if (!report || report.userId !== user.id) {
    res.status(404).json({ error: "Report not found" });
    return;
  }
  await db.delete(portfolioReportsTable).where(eq(portfolioReportsTable.id, id));
  res.json({ message: "Report deleted" });
});

export default router;
