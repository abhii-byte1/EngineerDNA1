import { db, githubReportsTable, getScorePercentile } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";

export interface PublicProfileData {
  githubUsername: string;
  overallScore: number;
  archetype: string | null;
  archetypeDescription: string | null;
  headlineStrengths: string[];
  topLanguages: string[];
  techStack: string[];
  percentile: number | null;
  cohortSize: number;
  updatedAt: Date;
}

export async function getPublicProfileData(rawUsername: string): Promise<PublicProfileData | null> {
  const username = rawUsername.trim().toLowerCase();

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

  if (!report || !report.isPublic) {
    return null;
  }

  const { percentile, cohortSize } = await getScorePercentile(
    db,
    report.overallScore ?? 0,
    report.track || undefined
  );

  return {
    githubUsername: report.githubUsername,
    overallScore: report.overallScore ?? 0,
    archetype: report.archetype,
    archetypeDescription: report.archetypeDescription,
    headlineStrengths: report.headlineStrengths ?? report.strengths?.slice(0, 3) ?? [],
    topLanguages: report.topLanguages ?? [],
    techStack: report.techStack?.slice(0, 8) ?? [],
    percentile,
    cohortSize,
    updatedAt: report.createdAt,
  };
}
