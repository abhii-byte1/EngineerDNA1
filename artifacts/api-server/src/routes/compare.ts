import { Router } from "express";
import { compareLimiter } from "../lib/rate-limiters";
import { getPublicProfileData } from "../lib/public-profile-helper";

const router = Router();

// GET /api/compare/:username1/:username2
router.get("/:username1/:username2", compareLimiter, async (req, res) => {
  const username1 = req.params.username1 as string;
  const username2 = req.params.username2 as string;

  const [user1Profile, user2Profile] = await Promise.all([
    getPublicProfileData(username1),
    getPublicProfileData(username2),
  ]);

  // CRITICAL REQUIREMENT: Must return 404 if EITHER profile is missing or private.
  // Comparison either fully works or fails clearly together.
  if (!user1Profile || !user2Profile) {
    res.status(404).json({ error: "One or both public profiles not found" });
    return;
  }

  res.json({
    user1: user1Profile,
    user2: user2Profile,
  });
});

export default router;
