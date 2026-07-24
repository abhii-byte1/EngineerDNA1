import { Router } from "express";
import { z } from "zod";
import { db, feedbackTable, sessionsTable, usersTable } from "@workspace/db";
import { eq, and, gt } from "drizzle-orm";
import { feedbackLimiter } from "../lib/rate-limiters";

const router = Router();

const feedbackSchema = z.object({
  context: z.string().min(1, "Context is required"),
  contextId: z.string().optional(),
  rating: z.enum(["up", "down"]).optional(),
  comment: z.string().max(1000, "Comment cannot exceed 1000 characters").optional(),
});

// POST /api/feedback — accepts both authenticated & anonymous feedback
router.post("/", feedbackLimiter, async (req, res) => {
  const parsed = feedbackSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input", details: parsed.error.flatten().fieldErrors });
    return;
  }

  const { context, contextId, rating, comment } = parsed.data;

  // Extract optional user session if present
  let userId: number | null = null;
  const token = req.cookies?.session_token as string | undefined;
  if (token) {
    try {
      const [session] = await db
        .select()
        .from(sessionsTable)
        .where(and(eq(sessionsTable.token, token), gt(sessionsTable.expiresAt, new Date())))
        .limit(1);
      if (session) {
        userId = session.userId;
      }
    } catch {
      // Ignore auth check error for feedback fallback
    }
  }

  try {
    const [entry] = await db
      .insert(feedbackTable)
      .values({
        userId,
        context,
        contextId: contextId ?? null,
        rating: rating ?? null,
        comment: comment ?? null,
      })
      .returning();

    res.json({ message: "Feedback submitted successfully", id: entry.id });
  } catch (err) {
    console.error("[feedback] error submitting feedback:", err);
    res.status(500).json({ error: "Failed to submit feedback" });
  }
});

export default router;
