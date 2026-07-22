import { Router } from "express";
import { db } from "@workspace/db";
import { resumeReportsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth, type AuthenticatedRequest } from "../middlewares/auth";
import { gemini } from "../lib/ai";

const router = Router();

// POST /api/resume-dna/analyze
router.post("/analyze", requireAuth, async (req, res) => {
  const { user } = req as AuthenticatedRequest;
  const { resumeText, targetRole } = req.body as { resumeText: string; targetRole?: string };

  if (!resumeText?.trim()) {
    res.status(400).json({ error: "resumeText is required" });
    return;
  }

  const [report] = await db
    .insert(resumeReportsTable)
    .values({ userId: user.id, resumeText: resumeText.trim(), targetRole: targetRole ?? null, status: "analyzing" })
    .returning();

  try {
    const response = await gemini.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Analyze this engineering resume and return a JSON assessment.

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
      config: {
        responseMimeType: "application/json",
        systemInstruction: "You are a senior engineering hiring manager and technical recruiter with 15 years of experience reviewing software engineering resumes. You give brutally honest, specific, actionable feedback.",
      },
    });

    const analysis = JSON.parse(response.text ?? "{}") as Record<string, unknown>;

    const [updated] = await db
      .update(resumeReportsTable)
      .set({
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
      })
      .where(eq(resumeReportsTable.id, report.id))
      .returning();

    res.json(JSON.parse(JSON.stringify(updated)));
  } catch (err) {
    console.error("[resume-dna] analysis error:", err);
    await db.update(resumeReportsTable).set({ status: "failed" }).where(eq(resumeReportsTable.id, report.id));
    res.status(500).json({ error: "Analysis failed", details: err instanceof Error ? err.message : String(err) });
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

export default router;
