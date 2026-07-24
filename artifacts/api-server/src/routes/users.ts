import { Router } from "express";
import { z } from "zod";
import { db } from "@workspace/db";
import {
  usersTable,
  sessionsTable,
  githubReportsTable,
  resumeReportsTable,
  roadmapsTable,
  milestonesTable,
  goalsTable,
} from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, type AuthenticatedRequest } from "../middlewares/auth";

const router = Router();

// ── Zod Schemas ───────────────────────────────────────────────────────────────
const patchProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  bio: z.string().max(1000).optional(),
  targetRole: z.string().max(100).optional(),
  experienceLevel: z.enum(["junior", "mid", "senior", "staff", "principal"]).optional(),
  primaryTrack: z.string().max(100).optional(),
  yearsOfExperience: z.number().int().min(0).max(50).optional(),
  skills: z.array(z.string().max(50)).max(50).optional(),
});

// GET /api/users/profile
router.get("/profile", requireAuth, (req, res) => {
  const { user } = req as AuthenticatedRequest;
  res.json(JSON.parse(JSON.stringify(user)));
});

// PATCH /api/users/profile
router.patch("/profile", requireAuth, async (req, res) => {
  const { user } = req as AuthenticatedRequest;

  // FIX: Validate and sanitize all inputs with Zod
  const parsed = patchProfileSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input", details: parsed.error.flatten().fieldErrors });
    return;
  }

  const { name, bio, targetRole, experienceLevel, primaryTrack, yearsOfExperience, skills } = parsed.data;

  const [updated] = await db
    .update(usersTable)
    .set({
      ...(name !== undefined && { name }),
      ...(bio !== undefined && { bio }),
      ...(targetRole !== undefined && { targetRole }),
      ...(experienceLevel !== undefined && { experienceLevel }),
      ...(primaryTrack !== undefined && { primaryTrack }),
      ...(yearsOfExperience !== undefined && { yearsOfExperience }),
      ...(skills !== undefined && { skills }),
      updatedAt: new Date(),
    })
    .where(eq(usersTable.id, user.id))
    .returning();

  res.json(JSON.parse(JSON.stringify(updated)));
});

// DELETE /api/users/me — GDPR "right to be forgotten": deletes all user data
router.delete("/me", requireAuth, async (req, res) => {
  const { user, sessionToken } = req as AuthenticatedRequest;
  const userId = user.id;

  try {
    // Delete in dependency order (children before parents)
    const userGoals = await db.select().from(goalsTable).where(eq(goalsTable.userId, userId));
    for (const g of userGoals) {
      await db.delete(goalsTable).where(eq(goalsTable.id, g.id));
    }

    const userRoadmaps = await db.select().from(roadmapsTable).where(eq(roadmapsTable.userId, userId));
    for (const r of userRoadmaps) {
      await db.delete(milestonesTable).where(eq(milestonesTable.roadmapId, r.id));
      await db.delete(roadmapsTable).where(eq(roadmapsTable.id, r.id));
    }

    await db.delete(githubReportsTable).where(eq(githubReportsTable.userId, userId));
    await db.delete(resumeReportsTable).where(eq(resumeReportsTable.userId, userId));

    // Delete all sessions then the user record
    await db.delete(sessionsTable).where(eq(sessionsTable.userId, userId));
    await db.delete(usersTable).where(eq(usersTable.id, userId));

    res.clearCookie("session_token");
    res.json({ message: "Account and all associated data deleted successfully." });
  } catch (err) {
    console.error("[users] delete account error:", err);
    res.status(500).json({ error: "Failed to delete account. Please try again." });
  }
});

export default router;
