import { Router } from "express";
import { db } from "@workspace/db";
import { roadmapsTable, milestonesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, type AuthenticatedRequest } from "../middlewares/auth";
import { gemini } from "../lib/ai";

const router = Router();

async function getRoadmapWithMilestones(userId: number) {
  const [roadmap] = await db.select().from(roadmapsTable).where(eq(roadmapsTable.userId, userId)).limit(1);
  if (!roadmap) return null;
  const milestones = await db.select().from(milestonesTable).where(eq(milestonesTable.roadmapId, roadmap.id));
  return { ...roadmap, milestones: milestones.sort((a, b) => a.weekNumber - b.weekNumber) };
}

// GET /api/roadmap
router.get("/", requireAuth, async (req, res) => {
  const { user } = req as AuthenticatedRequest;
  const roadmap = await getRoadmapWithMilestones(user.id);
  if (!roadmap) {
    res.status(404).json({ error: "No roadmap found. Generate one to get started." });
    return;
  }
  res.json(JSON.parse(JSON.stringify(roadmap)));
});

// POST /api/roadmap — generate roadmap
router.post("/", requireAuth, async (req, res) => {
  const { user } = req as AuthenticatedRequest;
  const { track, targetRole, currentLevel } = req.body as {
    track: string;
    targetRole: string;
    currentLevel: string;
  };

  if (!track || !targetRole || !currentLevel) {
    res.status(400).json({ error: "track, targetRole, and currentLevel are required" });
    return;
  }

  try {
    const response = await gemini.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Create a comprehensive engineering growth roadmap.

Track: ${track}
Target Role: ${targetRole}
Current Level: ${currentLevel}

Return ONLY valid JSON:
{
  "estimatedWeeks": <8-52 integer>,
  "weeklyGoal": "<what to accomplish each week>",
  "monthlyGoal": "<what to accomplish each month>",
  "recommendedProjects": [<4-6 specific project ideas with clear value>],
  "recommendedCourses": [<3-5 specific course names with providers>],
  "recommendedBooks": [<2-4 specific book titles>],
  "milestones": [
    {
      "title": "<milestone name>",
      "description": "<what completing this milestone means>",
      "weekNumber": <week number when this should be complete>,
      "skills": [<skills this milestone builds>],
      "tasks": [<3-5 specific tasks to complete this milestone>]
    }
  ]
}

Generate 6-12 milestones spread across the timeline. Be specific and practical.`,
      config: {
        responseMimeType: "application/json",
        systemInstruction: "You are an expert engineering career coach who creates precise, actionable roadmaps for software engineers. Your roadmaps are week-by-week, milestone-driven, and deeply practical.",
      },
    });

    const plan = JSON.parse(response.text ?? "{}") as Record<string, unknown>;

    // Delete existing roadmap if any
    const existing = await db.select().from(roadmapsTable).where(eq(roadmapsTable.userId, user.id)).limit(1);
    if (existing.length > 0) {
      await db.delete(milestonesTable).where(eq(milestonesTable.roadmapId, existing[0].id));
      await db.delete(roadmapsTable).where(eq(roadmapsTable.userId, user.id));
    }

    const [roadmap] = await db
      .insert(roadmapsTable)
      .values({
        userId: user.id,
        track,
        targetRole,
        currentLevel,
        estimatedWeeks: plan.estimatedWeeks as number,
        weeklyGoal: plan.weeklyGoal as string,
        monthlyGoal: plan.monthlyGoal as string,
        recommendedProjects: (plan.recommendedProjects as string[]) ?? [],
        recommendedCourses: (plan.recommendedCourses as string[]) ?? [],
        recommendedBooks: (plan.recommendedBooks as string[]) ?? [],
      })
      .returning();

    const milestoneData = (plan.milestones as Record<string, unknown>[]) ?? [];
    if (milestoneData.length > 0) {
      await db.insert(milestonesTable).values(
        milestoneData.map((m) => ({
          roadmapId: roadmap.id,
          title: m.title as string,
          description: m.description as string,
          weekNumber: m.weekNumber as number,
          skills: (m.skills as string[]) ?? [],
          tasks: (m.tasks as string[]) ?? [],
        })),
      );
    }

    const result = await getRoadmapWithMilestones(user.id);
    res.json(JSON.parse(JSON.stringify(result)));
  } catch (err) {
    console.error("[roadmap] generation error:", err);
    res.status(500).json({ error: "Roadmap generation failed", details: err instanceof Error ? err.message : String(err) });
  }
});

// PATCH /api/roadmap/milestones/:milestoneId
router.patch("/milestones/:milestoneId", requireAuth, async (req, res) => {
  const { user } = req as AuthenticatedRequest;
  const milestoneId = parseInt(req.params.milestoneId as string, 10);
  const { completed } = req.body as { completed: boolean };

  const [milestone] = await db.select().from(milestonesTable).where(eq(milestonesTable.id, milestoneId)).limit(1);
  if (!milestone) {
    res.status(404).json({ error: "Milestone not found" });
    return;
  }

  // Verify ownership
  const [roadmap] = await db.select().from(roadmapsTable).where(eq(roadmapsTable.id, milestone.roadmapId)).limit(1);
  if (!roadmap || roadmap.userId !== user.id) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const [updated] = await db
    .update(milestonesTable)
    .set({ completed, completedAt: completed ? new Date() : null })
    .where(eq(milestonesTable.id, milestoneId))
    .returning();

  res.json(JSON.parse(JSON.stringify(updated)));
});

export default router;
