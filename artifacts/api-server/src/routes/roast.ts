import { Router } from "express";
import { z } from "zod";
import { roastLimiter } from "../lib/rate-limiters";
import { analyzeGitHubProfile, type GitHubAnalysisResult } from "../lib/github-analysis";
import { getScorePercentile, db } from "@workspace/db";
import { verifyTurnstile } from "../lib/turnstile";

const router = Router();

const roastSchema = z.object({
  githubUsername: z
    .string()
    .min(1, "GitHub username is required")
    .max(39, "GitHub username cannot exceed 39 characters")
    .regex(/^[a-zA-Z0-9-]+$/, "Invalid GitHub username format"),
  mode: z.enum(["roast", "coach"]).default("roast"),
  turnstileToken: z.string().min(1, "Verification token is required"),
});

// Simple 24-hour in-memory cache per username & mode
interface CachedRoast {
  data: GitHubAnalysisResult & { percentile: number | null; cohortSize: number };
  timestamp: number;
}
const roastCache = new Map<string, CachedRoast>();
const TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

// Helper to clean expired cache entries periodically
function getCachedResult(key: string) {
  const cached = roastCache.get(key);
  if (!cached) return null;
  if (Date.now() - cached.timestamp > TTL_MS) {
    roastCache.delete(key);
    return null;
  }
  return cached.data;
}

// POST /api/roast
router.post("/", roastLimiter, async (req, res) => {
  const parsed = roastSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input", details: parsed.error.flatten().fieldErrors });
    return;
  }

  const { githubUsername, mode, turnstileToken } = parsed.data;

  const isHuman = await verifyTurnstile(turnstileToken);
  if (!isHuman) {
    res.status(400).json({ error: "Verification failed. Please try again." });
    return;
  }

  const cacheKey = `roast:${githubUsername.toLowerCase()}:${mode}`;

  // Check 24h cache first
  const cached = getCachedResult(cacheKey);
  if (cached) {
    res.json({ ...cached, cached: true });
    return;
  }

  try {
    const analysis = await analyzeGitHubProfile(githubUsername, mode);
    const { percentile, cohortSize } = await getScorePercentile(db, analysis.overallScore);

    const payload = {
      ...analysis,
      percentile,
      cohortSize,
    };

    // Store in cache
    roastCache.set(cacheKey, { data: payload, timestamp: Date.now() });

    res.json(payload);
  } catch (err) {
    console.error("[roast] analysis error:", err);
    const errorMsg = err instanceof Error ? err.message : "Roast generation failed. Please try again.";
    if (errorMsg === "GitHub user not found") {
      res.status(404).json({ error: errorMsg });
    } else {
      res.status(500).json({ error: errorMsg });
    }
  }
});

export default router;
