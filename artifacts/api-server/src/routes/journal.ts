import { Router } from "express";
import { db } from "@workspace/db";
import { journalEntriesTable } from "@workspace/db";
import { eq, desc, and, gte, lte } from "drizzle-orm";
import { requireAuth, type AuthenticatedRequest } from "../middlewares/auth";
import { gemini } from "../lib/ai";

const router = Router();

// GET /api/journal/entries
router.get("/entries", requireAuth, async (req, res) => {
  const { user } = req as AuthenticatedRequest;
  const entries = await db
    .select()
    .from(journalEntriesTable)
    .where(eq(journalEntriesTable.userId, user.id))
    .orderBy(desc(journalEntriesTable.weekOf));
  res.json(JSON.parse(JSON.stringify(entries)));
});

// POST /api/journal/entries
router.post("/entries", requireAuth, async (req, res) => {
  const { user } = req as AuthenticatedRequest;
  const { weekOf, learnings, achievements, mistakes, lessons, mood } = req.body as {
    weekOf: string;
    learnings: string;
    achievements: string;
    mistakes: string;
    lessons: string;
    mood: string;
  };

  if (!weekOf) {
    res.status(400).json({ error: "weekOf is required" });
    return;
  }

  // Generate AI insights
  let aiInsights: string | null = null;
  try {
    const response = await gemini.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Week of: ${weekOf}
Mood: ${mood}
Learnings: ${learnings}
Achievements: ${achievements}
Mistakes: ${mistakes}
Lessons: ${lessons}

Provide a brief, insightful mentor response.`,
      config: {
        systemInstruction: "You are an expert engineering mentor. Analyze this week's journal entry and provide a concise, actionable insight paragraph (3-4 sentences) that identifies patterns, celebrates wins, and suggests a concrete focus for next week.",
      },
    });
    aiInsights = response.text ?? null;
  } catch (err) {
    console.warn("[journal] AI insights failed:", err);
  }

  const [entry] = await db
    .insert(journalEntriesTable)
    .values({ userId: user.id, weekOf, learnings: learnings ?? "", achievements: achievements ?? "", mistakes: mistakes ?? "", lessons: lessons ?? "", mood: mood ?? "okay", aiInsights })
    .returning();

  res.status(201).json(JSON.parse(JSON.stringify(entry)));
});

// GET /api/journal/entries/:id
router.get("/entries/:id", requireAuth, async (req, res) => {
  const { user } = req as AuthenticatedRequest;
  const id = parseInt(req.params.id as string, 10);
  const [entry] = await db.select().from(journalEntriesTable).where(eq(journalEntriesTable.id, id)).limit(1);
  if (!entry || entry.userId !== user.id) {
    res.status(404).json({ error: "Entry not found" });
    return;
  }
  res.json(JSON.parse(JSON.stringify(entry)));
});

// PATCH /api/journal/entries/:id
router.patch("/entries/:id", requireAuth, async (req, res) => {
  const { user } = req as AuthenticatedRequest;
  const id = parseInt(req.params.id as string, 10);
  const [existing] = await db.select().from(journalEntriesTable).where(eq(journalEntriesTable.id, id)).limit(1);
  if (!existing || existing.userId !== user.id) {
    res.status(404).json({ error: "Entry not found" });
    return;
  }

  const { learnings, achievements, mistakes, lessons, mood } = req.body as Record<string, string>;
  const [updated] = await db
    .update(journalEntriesTable)
    .set({
      ...(learnings !== undefined && { learnings }),
      ...(achievements !== undefined && { achievements }),
      ...(mistakes !== undefined && { mistakes }),
      ...(lessons !== undefined && { lessons }),
      ...(mood !== undefined && { mood }),
      updatedAt: new Date(),
    })
    .where(eq(journalEntriesTable.id, id))
    .returning();

  res.json(JSON.parse(JSON.stringify(updated)));
});

// DELETE /api/journal/entries/:id
router.delete("/entries/:id", requireAuth, async (req, res) => {
  const { user } = req as AuthenticatedRequest;
  const id = parseInt(req.params.id as string, 10);
  const [existing] = await db.select().from(journalEntriesTable).where(eq(journalEntriesTable.id, id)).limit(1);
  if (!existing || existing.userId !== user.id) {
    res.status(404).json({ error: "Entry not found" });
    return;
  }
  await db.delete(journalEntriesTable).where(eq(journalEntriesTable.id, id));
  res.json({ message: "Entry deleted" });
});

// GET /api/journal/monthly-report
router.get("/monthly-report", requireAuth, async (req, res) => {
  const { user } = req as AuthenticatedRequest;

  // Get entries from the last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const dateStr = thirtyDaysAgo.toISOString().split("T")[0];

  const entries = await db
    .select()
    .from(journalEntriesTable)
    .where(and(eq(journalEntriesTable.userId, user.id), gte(journalEntriesTable.weekOf, dateStr)))
    .orderBy(desc(journalEntriesTable.weekOf));

  if (entries.length === 0) {
    res.status(404).json({ error: "No journal entries found for this month" });
    return;
  }

  const moodValues: Record<string, number> = { great: 5, good: 4, okay: 3, rough: 2, terrible: 1 };
  const avgMoodScore = entries.reduce((acc, e) => acc + (moodValues[e.mood] ?? 3), 0) / entries.length;
  const avgMoodLabel = avgMoodScore >= 4.5 ? "great" : avgMoodScore >= 3.5 ? "good" : avgMoodScore >= 2.5 ? "okay" : avgMoodScore >= 1.5 ? "rough" : "terrible";

  try {
    const response = await gemini.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Analyze these ${entries.length} journal entries from the past month and return a JSON report.

Entries:
${entries.map((e) => `Week of ${e.weekOf}: Learnings: ${e.learnings} | Achievements: ${e.achievements} | Mistakes: ${e.mistakes} | Lessons: ${e.lessons} | Mood: ${e.mood}`).join("\n\n")}

Return ONLY valid JSON:
{
  "aiSummary": "<3-4 sentence insightful summary of growth patterns>",
  "topLearnings": [<top 3-5 recurring or impactful learnings>],
  "topAchievements": [<top 3-5 achievements>],
  "recurringMistakes": [<mistakes that appear multiple times>],
  "keyLessons": [<most important lessons to carry forward>],
  "growthScore": <0-100 integer reflecting overall growth momentum>
}`,
      config: {
        responseMimeType: "application/json",
        systemInstruction: "You are an expert engineering mentor. Synthesize these journal entries into a monthly growth report with patterns, themes, and actionable guidance.",
      },
    });

    const report = JSON.parse(response.text ?? "{}") as Record<string, unknown>;

    // Compute month label
    const now = new Date();
    const monthLabel = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    res.json({
      month: monthLabel,
      totalEntries: entries.length,
      averageMood: avgMoodLabel,
      growthScore: report.growthScore ?? 50,
      aiSummary: report.aiSummary ?? "",
      topLearnings: report.topLearnings ?? [],
      topAchievements: report.topAchievements ?? [],
      recurringMistakes: report.recurringMistakes ?? [],
      keyLessons: report.keyLessons ?? [],
    });
  } catch (err) {
    console.error("[journal] monthly report error:", err);
    res.status(500).json({ error: "Monthly report generation failed", details: err instanceof Error ? err.message : String(err) });
  }
});

export default router;
