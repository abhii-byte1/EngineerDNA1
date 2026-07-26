import { Router } from "express";
import { z } from "zod";
import { roastLimiter } from "../lib/rate-limiters";
import { optionalAuth } from "../middlewares/optional-auth";
import type { AuthenticatedRequest } from "../middlewares/auth";
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

function getCachedResult(key: string) {
  const cached = roastCache.get(key);
  if (!cached) return null;
  if (Date.now() - cached.timestamp > TTL_MS) {
    roastCache.delete(key);
    return null;
  }
  return cached.data;
}

function formatRoastResponse(
  fullPayload: GitHubAnalysisResult & { percentile: number | null; cohortSize: number },
  locked: boolean
) {
  const headlineStrengths = (fullPayload.headlineStrengths || fullPayload.strengths || []).slice(0, 2);

  if (locked) {
    return {
      overallScore: fullPayload.overallScore,
      archetype: fullPayload.archetype,
      archetypeDescription: fullPayload.archetypeDescription,
      headlineStrengths,
      topLanguages: fullPayload.topLanguages || [],
      techStack: fullPayload.techStack || [],
      percentile: fullPayload.percentile,
      cohortSize: fullPayload.cohortSize,
      locked: true,
    };
  }

  return {
    ...fullPayload,
    headlineStrengths,
    locked: false,
  };
}

// POST /api/roast
router.post("/", optionalAuth, roastLimiter, async (req, res) => {
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
  const authReq = req as AuthenticatedRequest;
  const locked = !authReq.user;

  // Check 24h cache first
  const cached = getCachedResult(cacheKey);
  if (cached) {
    res.json({ ...formatRoastResponse(cached, locked), cached: true });
    return;
  }

  try {
    const analysis = await analyzeGitHubProfile(githubUsername, mode);
    const { percentile, cohortSize } = await getScorePercentile(db, analysis.overallScore);

    const fullPayload = {
      ...analysis,
      percentile,
      cohortSize,
    };

    // Store FULL payload in cache
    roastCache.set(cacheKey, { data: fullPayload, timestamp: Date.now() });

    res.json(formatRoastResponse(fullPayload, locked));
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
