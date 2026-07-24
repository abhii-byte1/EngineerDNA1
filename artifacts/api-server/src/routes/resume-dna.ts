import { Router } from "express";
import { z } from "zod";
import { db } from "@workspace/db";
import { resumeReportsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth, type AuthenticatedRequest } from "../middlewares/auth";
import { aiLimiter } from "../lib/rate-limiters";
import { runAnalysis } from "../lib/run-analysis";

const router = Router();

// ── Zod Schemas ───────────────────────────────────────────────────────────────
const analyzeSchema = z.object({
  // FIX: Cap resume text to prevent abuse and excessive AI token costs
  resumeText: z
    .string()
    .min(50, "Resume text is too short")
    .max(20000, "Resume text cannot exceed 20,000 characters"),
  targetRole: z.string().max(100).optional(),
});

// POST /api/resume-dna/analyze
router.post("/analyze", requireAuth, aiLimiter, async (req, res) => {
  const { user } = req as AuthenticatedRequest;

  // FIX: Validate input with Zod
  const parsed = analyzeSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input", details: parsed.error.flatten().fieldErrors });
    return;
  }

  const { resumeText, targetRole } = parsed.data;

  try {
    const { row: updated } = await runAnalysis({
      table: resumeReportsTable,
      insertValues: { userId: user.id, resumeText, targetRole: targetRole ?? null, status: "analyzing" },
      buildPrompt: () => `Analyze this engineering resume and return a JSON assessment.

${targetRole ? `Target Role: ${targetRole}` : ""}

Resume:
${resumeText.slice(0, 6000)}

Return ONLY valid JSON:
{
  "overallScore": <0-100>,
  "writingQualityScore": <0-100>,
  "technicalAccuracyScore": <0-100>,
  "impactScore": <0-100>,
  "strengths": [<3-5 specific strengths>],
  "weaknesses": [<3-5 specific weaknesses>],
  "missingSkills": [<skills that should be added for the target role>],
  "weakClaims": [<vague bullet points that need strengthening, quoted from resume>],
  "improvedBullets": [<rewritten versions of the weak claims with metrics and impact>],
  "insights": [
    {
      "observation": "<what you observed>",
      "evidence": "<specific text from resume>",
      "reason": "<why it matters to recruiters>",
      "impact": "<hiring impact>",
      "actionPlan": "<exact fix>",
      "priority": "<critical|high|medium|low>",
      "estimatedImprovement": "<expected improvement>"
    }
  ]
}`,
      systemInstruction: "You are a senior engineering hiring manager and technical recruiter with 15 years of experience reviewing software engineering resumes. You give brutally honest, specific, actionable feedback.",
      mapResult: (analysis) => ({
        status: "completed",
        overallScore: analysis.overallScore as number,
        writingQualityScore: analysis.writingQualityScore as number,
        technicalAccuracyScore: analysis.technicalAccuracyScore as number,
        impactScore: analysis.impactScore as number,
        strengths: (analysis.strengths as string[]) ?? [],
        weaknesses: (analysis.weaknesses as string[]) ?? [],
        missingSkills: (analysis.missingSkills as string[]) ?? [],
        weakClaims: (analysis.weakClaims as string[]) ?? [],
        improvedBullets: (analysis.improvedBullets as string[]) ?? [],
        insights: (analysis.insights as import("../../../../lib/db/src/schema/github-reports").AnalysisInsight[]) ?? [],
      }),
    });

    res.json(JSON.parse(JSON.stringify(updated)));
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Analysis failed. Please try again.";
    res.status(500).json({ error: errorMsg });
  }
});

// GET /api/resume-dna/reports
router.get("/reports", requireAuth, async (req, res) => {
  const { user } = req as AuthenticatedRequest;
  const reports = await db
    .select()
    .from(resumeReportsTable)
    .where(eq(resumeReportsTable.userId, user.id))
    .orderBy(desc(resumeReportsTable.createdAt));
  res.json(JSON.parse(JSON.stringify(reports)));
});

// GET /api/resume-dna/reports/:id
router.get("/reports/:id", requireAuth, async (req, res) => {
  const { user } = req as AuthenticatedRequest;
  const id = parseInt(req.params.id as string, 10);
  const [report] = await db.select().from(resumeReportsTable).where(eq(resumeReportsTable.id, id)).limit(1);
  if (!report || report.userId !== user.id) {
    res.status(404).json({ error: "Report not found" });
    return;
  }
  res.json(JSON.parse(JSON.stringify(report)));
});

// DELETE /api/resume-dna/reports/:id
router.delete("/reports/:id", requireAuth, async (req, res) => {
  const { user } = req as AuthenticatedRequest;
  const id = parseInt(req.params.id as string, 10);
  const [report] = await db.select().from(resumeReportsTable).where(eq(resumeReportsTable.id, id)).limit(1);
  if (!report || report.userId !== user.id) {
    res.status(404).json({ error: "Report not found" });
    return;
  }
  await db.delete(resumeReportsTable).where(eq(resumeReportsTable.id, id));
  res.json({ message: "Report deleted" });
});

export default router;
