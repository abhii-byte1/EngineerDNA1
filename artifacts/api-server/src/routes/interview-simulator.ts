import { Router } from "express";
import { z } from "zod";
import { 
  db, 
  interviewSessionsTable, 
  githubReportsTable, 
  type InterviewMessage, 
  type InterviewFeedback 
} from "@workspace/db";
import { eq, and, desc, gte } from "drizzle-orm";
import { requireAuth, type AuthenticatedRequest } from "../middlewares/auth";
import { aiLimiter } from "../lib/rate-limiters";
import { gemini } from "../lib/ai";

const router = Router();

const startSessionSchema = z.object({
  track: z.string().default("Full Stack"),
  type: z.enum(["behavioral", "system_design", "coding"]).default("behavioral"),
  level: z.enum(["junior", "mid", "senior", "staff"]).default("mid"),
});

const answerSchema = z.object({
  answer: z.string().min(1, "Answer cannot be empty").max(4000),
});

// Helper to check monthly bounded limit (e.g., 5 sessions per month)
async function checkMonthlyLimit(userId: number): Promise<boolean> {
  const firstDayOfMonth = new Date();
  firstDayOfMonth.setDate(1);
  firstDayOfMonth.setHours(0, 0, 0, 0);

  const existingSessions = await db
    .select()
    .from(interviewSessionsTable)
    .where(
      and(
        eq(interviewSessionsTable.userId, userId),
        gte(interviewSessionsTable.createdAt, firstDayOfMonth)
      )
    );

  return existingSessions.length < 5;
}

// POST /api/interview-simulator/start
router.post("/start", requireAuth, ...aiLimiter, async (req, res) => {
  const { user } = req as AuthenticatedRequest;

  const parsed = startSessionSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input", details: parsed.error.flatten().fieldErrors });
    return;
  }

  const allowed = await checkMonthlyLimit(user.id);
  if (!allowed) {
    res.status(429).json({
      error: "Monthly interview session limit reached (5/5). Upgrade or wait for next month.",
    });
    return;
  }

  const { track, type, level } = parsed.data;

  // Retrieve user's latest GitHub report to ground behavioral questions in real projects
  const ghReports = await db
    .select()
    .from(githubReportsTable)
    .where(and(eq(githubReportsTable.userId, user.id), eq(githubReportsTable.status, "completed")))
    .orderBy(desc(githubReportsTable.createdAt))
    .limit(1);

  const ghReport = ghReports[0];

  const promptText = `Generate the opening question for a ${level}-level ${type} technical interview for a ${track} engineer.
${ghReport ? `Candidate's GitHub context: Top languages (${ghReport.topLanguages?.join(", ")}), Tech stack (${ghReport.techStack?.join(", ")}), Top strengths (${ghReport.strengths?.slice(0, 2).join("; ")}).` : ""}

Requirements:
- ${type === "behavioral" ? "Ask a situation-based architectural or project decision question, referencing real project scenarios." : ""}
- ${type === "system_design" ? "Ask a realistic system design trade-off question calibrated for a " + level + " engineer." : ""}
- ${type === "coding" ? "Ask an architectural/code quality design question (NOT a LeetCode algorithm problem, focus on domain modeling or concurrency)." : ""}
- Keep the question concise, professional, and clear.
- Return JSON: { "question": "<question string>" }`;

  try {
    const aiRes = await gemini.models.generateContent({
      model: "gemini-2.5-flash",
      contents: promptText,
      config: {
        responseMimeType: "application/json",
        systemInstruction: "You are a Principal Software Engineer interviewer conducting a structured technical interview.",
      },
    });

    const parsedAi = JSON.parse(aiRes.text ?? "{}");
    const initialQuestion = String(parsedAi.question || "Tell me about a complex technical trade-off you made in your recent projects.");

    const initialMessage: InterviewMessage = {
      role: "interviewer",
      content: initialQuestion,
      timestamp: new Date().toISOString(),
    };

    const [session] = await db
      .insert(interviewSessionsTable)
      .values({
        userId: user.id,
        track,
        type,
        level,
        questionCount: 1,
        maxQuestions: 4, // 4-question bounded session
        status: "active",
        transcript: [initialMessage],
      })
      .returning();

    res.json(session);
  } catch (err) {
    console.error("[interview-simulator] start error:", err);
    res.status(500).json({ error: "Failed to initialize interview session." });
  }
});

// POST /api/interview-simulator/sessions/:id/answer
router.post("/sessions/:id/answer", requireAuth, ...aiLimiter, async (req, res) => {
  const { user } = req as AuthenticatedRequest;
  const id = parseInt(req.params.id as string, 10);

  const parsed = answerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input", details: parsed.error.flatten().fieldErrors });
    return;
  }

  const [session] = await db
    .select()
    .from(interviewSessionsTable)
    .where(eq(interviewSessionsTable.id, id))
    .limit(1);

  if (!session || session.userId !== user.id) {
    res.status(404).json({ error: "Session not found" });
    return;
  }

  if (session.status === "completed") {
    res.status(400).json({ error: "This interview session is already completed." });
    return;
  }

  const transcript = session.transcript || [];
  const candidateMessage: InterviewMessage = {
    role: "candidate",
    content: parsed.data.answer.trim(),
    timestamp: new Date().toISOString(),
  };
  transcript.push(candidateMessage);

  const newQuestionCount = session.questionCount + 1;
  const isFinal = newQuestionCount > session.maxQuestions;

  try {
    if (isFinal) {
      // Evaluate session and return final feedback
      const evalPrompt = `Evaluate this complete technical interview transcript for a ${session.level} ${session.track} candidate doing a ${session.type} interview.

Transcript:
${JSON.stringify(transcript)}

Return ONLY valid JSON matching this exact structure:
{
  "overallScore": <0-100 integer score>,
  "communicationScore": <0-100 integer score>,
  "technicalDepthScore": <0-100 integer score>,
  "summary": "<2-3 sentence executive evaluation summary>",
  "keyStrengths": [<2-4 specific candidate strengths demonstrated in answers>],
  "growthAreas": [<2-4 specific areas where candidate needs deeper trade-off analysis or technical clarity>]
}`;

      const aiEvalRes = await gemini.models.generateContent({
        model: "gemini-2.5-flash",
        contents: evalPrompt,
        config: {
          responseMimeType: "application/json",
          systemInstruction: "You are a hiring manager synthesizing an objective candidate feedback report.",
        },
      });

      const feedback = JSON.parse(aiEvalRes.text ?? "{}") as InterviewFeedback;

      const [updated] = await db
        .update(interviewSessionsTable)
        .set({
          status: "completed",
          questionCount: session.maxQuestions,
          transcript,
          feedback,
          updatedAt: new Date(),
        })
        .where(eq(interviewSessionsTable.id, id))
        .returning();

      res.json(updated);
    } else {
      // Generate next question
      const nextQPrompt = `Continue this ${session.type} technical interview for a ${session.level} ${session.track} engineer.

Transcript so far:
${JSON.stringify(transcript)}

Ask question #${newQuestionCount} of ${session.maxQuestions}. Build directly on their previous response or drill deeper into a technical trade-off. Keep it concise.
Return JSON: { "question": "<next question string>" }`;

      const aiNextRes = await gemini.models.generateContent({
        model: "gemini-2.5-flash",
        contents: nextQPrompt,
        config: {
          responseMimeType: "application/json",
          systemInstruction: "You are a Senior Technical Interviewer following up on candidate responses.",
        },
      });

      const nextParsed = JSON.parse(aiNextRes.text ?? "{}");
      const nextQuestion = String(nextParsed.question || "Could you elaborate on the trade-offs of that approach?");

      const interviewerMessage: InterviewMessage = {
        role: "interviewer",
        content: nextQuestion,
        timestamp: new Date().toISOString(),
      };
      transcript.push(interviewerMessage);

      const [updated] = await db
        .update(interviewSessionsTable)
        .set({
          questionCount: newQuestionCount,
          transcript,
          updatedAt: new Date(),
        })
        .where(eq(interviewSessionsTable.id, id))
        .returning();

      res.json(updated);
    }
  } catch (err) {
    console.error("[interview-simulator] answer error:", err);
    res.status(500).json({ error: "Failed to process interview response." });
  }
});

// GET /api/interview-simulator/sessions
router.get("/sessions", requireAuth, async (req, res) => {
  const { user } = req as AuthenticatedRequest;
  const sessions = await db
    .select()
    .from(interviewSessionsTable)
    .where(eq(interviewSessionsTable.userId, user.id))
    .orderBy(desc(interviewSessionsTable.createdAt));

  res.json(sessions);
});

// GET /api/interview-simulator/sessions/:id
router.get("/sessions/:id", requireAuth, async (req, res) => {
  const { user } = req as AuthenticatedRequest;
  const id = parseInt(req.params.id as string, 10);

  const [session] = await db
    .select()
    .from(interviewSessionsTable)
    .where(eq(interviewSessionsTable.id, id))
    .limit(1);

  if (!session || session.userId !== user.id) {
    res.status(404).json({ error: "Session not found" });
    return;
  }

  res.json(session);
});

export default router;
