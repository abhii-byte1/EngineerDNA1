import { Router } from "express";
import { db } from "@workspace/db";
import { goalsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth, type AuthenticatedRequest } from "../middlewares/auth";

const router = Router();

// GET /api/goals
router.get("/", requireAuth, async (req, res) => {
  const { user } = req as AuthenticatedRequest;
  const goals = await db
    .select()
    .from(goalsTable)
    .where(eq(goalsTable.userId, user.id))
    .orderBy(desc(goalsTable.createdAt));
  res.json(JSON.parse(JSON.stringify(goals)));
});

// POST /api/goals
router.post("/", requireAuth, async (req, res) => {
  const { user } = req as AuthenticatedRequest;
  const { title, description, category, priority, targetDate } = req.body as {
    title: string;
    description?: string;
    category: string;
    priority?: string;
    targetDate?: string;
  };

  if (!title?.trim() || !category?.trim()) {
    res.status(400).json({ error: "title and category are required" });
    return;
  }

  const [goal] = await db
    .insert(goalsTable)
    .values({
      userId: user.id,
      title: title.trim(),
      description: description ?? null,
      category,
      priority: priority ?? "medium",
      targetDate: targetDate ?? null,
    })
    .returning();

  res.status(201).json(JSON.parse(JSON.stringify(goal)));
});

// PATCH /api/goals/:id
router.patch("/:id", requireAuth, async (req, res) => {
  const { user } = req as AuthenticatedRequest;
  const id = parseInt(req.params.id as string, 10);

  const [existing] = await db.select().from(goalsTable).where(eq(goalsTable.id, id)).limit(1);
  if (!existing || existing.userId !== user.id) {
    res.status(404).json({ error: "Goal not found" });
    return;
  }

  const { title, description, category, status, priority, targetDate, progress } = req.body as {
    title?: string;
    description?: string;
    category?: string;
    status?: string;
    priority?: string;
    targetDate?: string;
    progress?: number;
  };

  const completedAt =
    status === "completed" && existing.status !== "completed"
      ? new Date()
      : status !== "completed"
        ? null
        : existing.completedAt;

  const [updated] = await db
    .update(goalsTable)
    .set({
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(category !== undefined && { category }),
      ...(status !== undefined && { status }),
      ...(priority !== undefined && { priority }),
      ...(targetDate !== undefined && { targetDate }),
      ...(progress !== undefined && { progress: Math.min(100, Math.max(0, progress)) }),
      ...(completedAt !== undefined && { completedAt }),
      updatedAt: new Date(),
    })
    .where(eq(goalsTable.id, id))
    .returning();

  res.json(JSON.parse(JSON.stringify(updated)));
});

// DELETE /api/goals/:id
router.delete("/:id", requireAuth, async (req, res) => {
  const { user } = req as AuthenticatedRequest;
  const id = parseInt(req.params.id as string, 10);

  const [existing] = await db.select().from(goalsTable).where(eq(goalsTable.id, id)).limit(1);
  if (!existing || existing.userId !== user.id) {
    res.status(404).json({ error: "Goal not found" });
    return;
  }

  await db.delete(goalsTable).where(eq(goalsTable.id, id));
  res.json({ message: "Goal deleted" });
});

export default router;
