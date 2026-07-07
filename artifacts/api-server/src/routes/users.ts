import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, type AuthenticatedRequest } from "../middlewares/auth";

const router = Router();

// GET /api/users/profile
router.get("/profile", requireAuth, (req, res) => {
  const { user } = req as AuthenticatedRequest;
  res.json(JSON.parse(JSON.stringify(user)));
});

// PATCH /api/users/profile
router.patch("/profile", requireAuth, async (req, res) => {
  const { user } = req as AuthenticatedRequest;
  const { name, bio, targetRole, experienceLevel, primaryTrack, yearsOfExperience, skills } = req.body as {
    name?: string;
    bio?: string;
    targetRole?: string;
    experienceLevel?: string;
    primaryTrack?: string;
    yearsOfExperience?: number;
    skills?: string[];
  };

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

export default router;
