import { Router } from "express";
import { db, githubReportsTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { badgeLimiter } from "../lib/rate-limiters";

const router = Router();

// GET /api/badge/:username.svg
router.get("/:username.svg", badgeLimiter, async (req, res) => {
  const username = (req.params.username as string).replace(/\.svg$/i, "").trim().toLowerCase();

  // Read strictly from DB — NEVER trigger fresh AI analysis
  const reports = await db
    .select()
    .from(githubReportsTable)
    .where(
      and(
        eq(githubReportsTable.githubUsername, username),
        eq(githubReportsTable.status, "completed")
      )
    )
    .orderBy(desc(githubReportsTable.createdAt))
    .limit(1);

  const report = reports[0];

  res.setHeader("Content-Type", "image/svg+xml");
  res.setHeader("Cache-Control", "public, max-age=3600, s-maxage=3600");

  if (!report) {
    // Graceful SVG 404 fallback badge
    const fallbackSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="340" height="80" viewBox="0 0 340 80">
  <rect width="340" height="80" rx="12" fill="#090d16" stroke="#1e293b" stroke-width="1.5"/>
  <text x="20" y="32" fill="#94a3b8" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12" font-weight="600">ENGINEER DNA</text>
  <text x="20" y="56" fill="#64748b" font-family="ui-sans-serif, system-ui, sans-serif" font-size="14">No public analysis found</text>
</svg>`.trim();
    res.status(404).send(fallbackSvg);
    return;
  }

  const score = report.overallScore ?? 0;
  const archetypeTitle = (report.archetype || "Engineer")
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  let scoreColor = "#10b981"; // green
  if (score < 50) scoreColor = "#f43f5e"; // rose
  else if (score < 75) scoreColor = "#f59e0b"; // amber

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="380" height="96" viewBox="0 0 380 96">
  <defs>
    <linearGradient id="bg-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#020617"/>
    </linearGradient>
    <linearGradient id="score-grad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${scoreColor}"/>
      <stop offset="100%" stop-color="#6366f1"/>
    </linearGradient>
  </defs>

  <!-- Background container -->
  <rect width="380" height="96" rx="14" fill="url(#bg-grad)" stroke="#334155" stroke-width="1.5"/>
  <rect x="1" y="1" width="378" height="94" rx="13" fill="none" stroke="#64748b" stroke-opacity="0.2"/>

  <!-- Brand header -->
  <text x="20" y="28" fill="#94a3b8" font-family="ui-sans-serif, system-ui, -apple-system, sans-serif" font-size="11" font-weight="700" letter-spacing="1">ENGINEER DNA</text>

  <!-- Archetype text -->
  <text x="20" y="54" fill="#f8fafc" font-family="ui-sans-serif, system-ui, -apple-system, sans-serif" font-size="16" font-weight="700">${archetypeTitle}</text>
  
  <!-- Subtitle -->
  <text x="20" y="74" fill="#64748b" font-family="ui-sans-serif, system-ui, -apple-system, sans-serif" font-size="12">@${username}</text>

  <!-- Score pill -->
  <g transform="translate(290, 20)">
    <rect width="70" height="56" rx="10" fill="#1e293b" stroke="${scoreColor}" stroke-opacity="0.4" stroke-width="1.5"/>
    <text x="35" y="32" fill="${scoreColor}" font-family="ui-sans-serif, system-ui, -apple-system, sans-serif" font-size="22" font-weight="800" text-anchor="middle">${score}</text>
    <text x="35" y="48" fill="#94a3b8" font-family="ui-sans-serif, system-ui, -apple-system, sans-serif" font-size="9" font-weight="600" text-anchor="middle">SCORE</text>
  </g>
</svg>`.trim();

  res.send(svg);
});

export default router;
