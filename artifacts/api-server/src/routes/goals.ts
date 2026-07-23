import { Router } from "express";
import { z } from "zod";
import { db } from "@workspace/db";
import { goalsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth, type AuthenticatedRequest } from "../middlewares/auth";

const router = Router();

// ── Zod Schemas ───────────────────────────────────────────────────────────────
const PRIORITY_VALUES = ["low", "medium", "high", "critical"] as const;
const CATEGORY_VALUES = ["technical", "career", "learning", "soft-skills", "project", "other"] as const;
const STATUS_VALUES = ["active", "completed", "paused", "abandoned"] as const;

const createGoalSchema = z.object({
  title: z.string().min(1, "title is required").max(200, "Title cannot exceed 200 characters"),
  description: z.string().max(1000, "Description cannot exceed 1,000 characters").optional(),
  category: z.enum(CATEGORY_VALUES, {
    errorMap: () => ({ message: `category must be one of: ${CATEGORY_VALUES.join(", ")}` }),
  }),
  priority: z.enum(PRIORITY_VALUES).optional().default("medium"),
  targetDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "targetDate must be YYYY-MM-DD format")
    .optional(),
});

const updateGoalSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  category: z.enum(CATEGORY_VALUES).optional(),
  status: z.enum(STATUS_VALUES).optional(),
  priority: z.enum(PRIORITY_VALUES).optional(),
  targetDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  progress: z.number().int().min(0).max(100).optional(),
});

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

  // FIX: Validate and sanitize inputs with Zod
  const parsed = createGoalSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input", details: parsed.error.flatten().fieldErrors });
    return;
  }

  const { title, description, category, priority, targetDate } = parsed.data;

  const [goal] = await db
    .insert(goalsTable)
    .values({
      userId: user.id,
      title,
      description: description ?? null,
      category,
      priority,
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

  // FIX: Validate all update fields with Zod
  const parsed = updateGoalSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input", details: parsed.error.flatten().fieldErrors });
    return;
  }

  const { title, description, category, status, priority, targetDate, progress } = parsed.data;

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
      ...(progress !== undefined && { progress }),
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
