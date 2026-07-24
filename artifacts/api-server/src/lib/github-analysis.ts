import { gemini } from "./ai";
import { DEVELOPER_ARCHETYPES, type DeveloperArchetype } from "@workspace/db";

export interface GitHubAnalysisResult {
  overallScore: number;
  archetype: DeveloperArchetype;
  archetypeDescription: string;
  headlineStrengths: string[];
  strengths: string[];
  weaknesses: string[];
  techStack: string[];
  architectureIssues: string[];
  recommendations: string[];
  growthAreas: string[];
  insights: {
    observation: string;
    evidence: string;
    reason: string;
    impact: string;
    actionPlan: string;
    priority: "critical" | "high" | "medium" | "low";
    estimatedImprovement: string;
  }[];
  roastBullets?: string[];
  totalRepositories: number;
  topLanguages: string[];
}

export async function fetchGitHubProfileData(githubUsername: string) {
  const [userRes, reposRes] = await Promise.all([
    fetch(`https://api.github.com/users/${githubUsername}`, {
      headers: { "User-Agent": "EngineerDNA/1.0" },
    }),
    fetch(`https://api.github.com/users/${githubUsername}/repos?per_page=50&sort=updated`, {
      headers: { "User-Agent": "EngineerDNA/1.0" },
    }),
  ]);

  if (!userRes.ok) {
    throw new Error("GitHub user not found");
  }

  const ghUser = (await userRes.json()) as Record<string, unknown>;
  const repos = (reposRes.ok ? await reposRes.json() : []) as Record<string, unknown>[];

  const repoSummary = repos.slice(0, 25).map((r) => ({
    name: r.name,
    language: r.language,
    stars: r.stargazers_count,
    forked: r.fork,
    description: r.description,
    topics: r.topics,
    size: r.size,
    updated: r.updated_at,
  }));

  const langCounts: Record<string, number> = {};
  for (const r of repos) {
    if (r.language) {
      langCounts[r.language as string] = (langCounts[r.language as string] ?? 0) + 1;
    }
  }
  const topLanguages = Object.entries(langCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([l]) => l)
    .slice(0, 10);

  return { ghUser, repos, repoSummary, topLanguages };
}

export async function analyzeGitHubProfile(
  githubUsername: string,
  mode: "coach" | "roast" = "coach"
): Promise<GitHubAnalysisResult> {
  const { ghUser, repoSummary, topLanguages } = await fetchGitHubProfileData(githubUsername);

  const archetypesList = DEVELOPER_ARCHETYPES.join(", ");

  const promptText = `Analyze this GitHub profile and return a structured JSON engineering assessment.

GitHub Profile: ${JSON.stringify(ghUser)}
Repositories (most recent 25): ${JSON.stringify(repoSummary)}
Top Languages: ${topLanguages.join(", ")}

Return ONLY valid JSON matching this exact structure:
{
  "overallScore": <0-100 integer score based on repo quality, commit frequency, project complexity, and diversity>,
  "archetype": "<MUST be exactly one of: ${archetypesList}>",
  "archetypeDescription": "<1 punchy sentence describing why this developer archetype fits their profile>",
  "headlineStrengths": [<2-3 punchy, impressive one-line highlights suitable for a public scorecard>],
  "strengths": [<3-6 specific technical strengths>],
  "weaknesses": [<3-6 specific technical weaknesses or code hygiene gaps>],
  "techStack": [<detected technologies, frameworks, tools>],
  "architectureIssues": [<2-5 specific architectural or repo structure concerns>],
  "recommendations": [<4-6 actionable, specific engineering recommendations>],
  "growthAreas": [<3-5 high-impact skill growth opportunities>],
  "insights": [
    {
      "observation": "<observed pattern or gap>",
      "evidence": "<specific evidence from repo name, size, language, or commits>",
      "reason": "<why this matters for senior engineering progression>",
      "impact": "<business or code quality impact if unaddressed>",
      "actionPlan": "<concrete steps to resolve>",
      "priority": "<critical|high|medium|low>",
      "estimatedImprovement": "<expected score or skill gain>"
    }
  ]${mode === "roast" ? `,\n  "roastBullets": [<5 hilarious, sharp, but constructive roast observations about their commit habits, repo names, tech choices, or docs>]` : ""}
}`;

  const systemInstruction = mode === "roast"
    ? "You are a witty, hilarious, but sharp tech roast master and engineering coach. You analyze GitHub profiles with comedic precision while maintaining constructive underlying value. Reference actual repo names, habits, and languages."
    : "You are a brutally honest, expert engineering career coach. You analyze GitHub profiles with surgical precision to identify strengths, weaknesses, and growth opportunities. Be specific — reference actual repo names, languages, and patterns. Never be generic.";

  const response = await gemini.models.generateContent({
    model: "gemini-2.5-flash",
    contents: promptText,
    config: {
      responseMimeType: "application/json",
      systemInstruction,
    },
  });

  const parsed = JSON.parse(response.text ?? "{}") as Record<string, unknown>;

  // Fallback archetype if model strays
  const rawArchetype = String(parsed.archetype ?? "");
  const archetype: DeveloperArchetype = (DEVELOPER_ARCHETYPES as readonly string[]).includes(rawArchetype)
    ? (rawArchetype as DeveloperArchetype)
    : "full_stack_chameleon";

  return {
    overallScore: typeof parsed.overallScore === "number" ? Math.min(100, Math.max(0, parsed.overallScore)) : 70,
    archetype,
    archetypeDescription: String(parsed.archetypeDescription ?? "Versatile engineer handling front-end and back-end domain challenges."),
    headlineStrengths: Array.isArray(parsed.headlineStrengths) ? parsed.headlineStrengths.map(String) : [],
    strengths: Array.isArray(parsed.strengths) ? parsed.strengths.map(String) : [],
    weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses.map(String) : [],
    techStack: Array.isArray(parsed.techStack) ? parsed.techStack.map(String) : [],
    architectureIssues: Array.isArray(parsed.architectureIssues) ? parsed.architectureIssues.map(String) : [],
    recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations.map(String) : [],
    growthAreas: Array.isArray(parsed.growthAreas) ? parsed.growthAreas.map(String) : [],
    insights: Array.isArray(parsed.insights) ? (parsed.insights as any[]) : [],
    roastBullets: Array.isArray(parsed.roastBullets) ? parsed.roastBullets.map(String) : [],
    totalRepositories: Number(ghUser.public_repos ?? 0),
    topLanguages,
  };
}
