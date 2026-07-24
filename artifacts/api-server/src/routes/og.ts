import { Router } from "express";
import { ogLimiter } from "../lib/rate-limiters";
import { getPublicProfileData } from "../lib/public-profile-helper";

const router = Router();

// Escape XML string to prevent syntax errors
function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// GET /api/og/:username.png (or .svg fallback)
router.get("/:username", ogLimiter, async (req, res) => {
  let rawUsername = req.params.username as string;
  if (rawUsername.endsWith(".png") || rawUsername.endsWith(".svg")) {
    rawUsername = rawUsername.slice(0, rawUsername.lastIndexOf("."));
  }

  const profile = await getPublicProfileData(rawUsername);

  // Must return 404 if profile is missing or isPublic !== true
  if (!profile) {
    res.status(404).json({ error: "Public profile not found" });
    return;
  }

  const username = escapeXml(profile.githubUsername);
  const score = profile.overallScore;
  const archetype = escapeXml((profile.archetype || "Software Engineer").replace(/_/g, " ").toUpperCase());
  const strengths = profile.headlineStrengths.slice(0, 2).map(escapeXml);
  const percentileText = profile.percentile !== null ? `TOP ${100 - profile.percentile}%` : "RANKED";

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" fill="none">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1200" y2="630" gradientUnits="userSpaceOnUse">
      <stop stop-color="#0F172A" />
      <stop offset="0.5" stop-color="#1E1B4B" />
      <stop offset="1" stop-color="#020617" />
    </linearGradient>
    <linearGradient id="brand" x1="0" y1="0" x2="1" y2="0">
      <stop stop-color="#6366F1" />
      <stop offset="1" stop-color="#A855F7" />
    </linearGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0">
      <stop stop-color="#EC4899" />
      <stop offset="1" stop-color="#8B5CF6" />
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="1200" height="630" fill="url(#bg)" />
  <circle cx="1000" cy="150" r="300" fill="#6366F1" fill-opacity="0.12" filter="blur(80px)" />
  <circle cx="200" cy="500" r="250" fill="#EC4899" fill-opacity="0.1" filter="blur(80px)" />

  <!-- Outer Border -->
  <rect x="30" y="30" width="1140" height="570" rx="24" fill="none" stroke="#334155" stroke-width="2" />

  <!-- Header -->
  <rect x="70" y="70" width="48" height="48" rx="12" fill="url(#brand)" />
  <text x="83" y="102" font-family="system-ui, sans-serif" font-weight="900" font-size="20" fill="#FFFFFF">DNA</text>
  <text x="134" y="102" font-family="system-ui, sans-serif" font-weight="800" font-size="28" fill="#F8FAFC" letter-spacing="-1">EngineerDNA</text>

  <!-- Score Badge Card -->
  <rect x="70" y="155" width="1060" height="405" rx="20" fill="#0F172A" fill-opacity="0.7" stroke="#1E293B" stroke-width="2" />

  <!-- Username & Archetype -->
  <text x="120" y="235" font-family="monospace" font-weight="700" font-size="20" fill="#94A3B8" letter-spacing="2">PUBLIC PROFILE SCORECARD</text>
  <text x="120" y="305" font-family="system-ui, sans-serif" font-weight="900" font-size="56" fill="#F8FAFC">@${username}</text>
  <rect x="120" y="330" width="360" height="42" rx="21" fill="url(#accent)" fill-opacity="0.2" stroke="#EC4899" stroke-opacity="0.4" />
  <text x="140" y="357" font-family="system-ui, sans-serif" font-weight="700" font-size="16" fill="#F472B6">${archetype}</text>

  <!-- Score Display -->
  <rect x="850" y="200" width="230" height="170" rx="16" fill="#1E1B4B" stroke="#6366F1" stroke-width="2" />
  <text x="965" y="240" font-family="system-ui, sans-serif" font-weight="700" font-size="16" fill="#A5B4FC" text-anchor="middle">DNA SCORE</text>
  <text x="965" y="315" font-family="monospace" font-weight="900" font-size="72" fill="#6366F1" text-anchor="middle">${score}</text>
  <text x="965" y="350" font-family="system-ui, sans-serif" font-weight="800" font-size="16" fill="#F59E0B" text-anchor="middle">${percentileText}</text>

  <!-- Strengths -->
  <text x="120" y="425" font-family="system-ui, sans-serif" font-weight="800" font-size="18" fill="#94A3B8">KEY STRENGTHS</text>
  ${strengths
    .map(
      (s, i) =>
        `<rect x="120" y="${445 + i * 45}" width="960" height="36" rx="8" fill="#1E293B" fill-opacity="0.8" />
   <text x="140" y="${468 + i * 45}" font-family="system-ui, sans-serif" font-weight="600" font-size="16" fill="#E2E8F0">✓ ${s}</text>`
    )
    .join("\n  ")}
</svg>`;

  res.setHeader("Content-Type", "image/svg+xml");
  res.setHeader("Cache-Control", "public, max-age=3600, s-maxage=86400");
  res.send(svg);
});

export default router;
