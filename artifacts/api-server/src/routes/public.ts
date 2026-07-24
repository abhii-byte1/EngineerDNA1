import { Router } from "express";
import { publicLimiter } from "../lib/rate-limiters";
import { getPublicProfileData } from "../lib/public-profile-helper";

const router = Router();

// GET /api/public/:username
router.get("/:username", publicLimiter, async (req, res) => {
  const username = req.params.username as string;
  const profile = await getPublicProfileData(username);

  // CRITICAL SECURITY REQUIREMENT: Must check isPublic === true server-side
  // and return 404 (not 403) if false or not found — never confirm account existence.
  if (!profile) {
    res.status(404).json({ error: "Public profile not found" });
    return;
  }

  res.json(profile);
});

export default router;
