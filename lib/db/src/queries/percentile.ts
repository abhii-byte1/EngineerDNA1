import { sql } from "drizzle-orm";

export async function getScorePercentile(db: any, score: number, track?: string) {
  const query = sql`
    SELECT
      COUNT(*) FILTER (WHERE overall_score <= ${score})::float
      / NULLIF(COUNT(*), 0) * 100 AS percentile,
      COUNT(*) AS cohort_size
    FROM github_reports
    WHERE status = 'completed'
    ${track ? sql`AND track = ${track}` : sql``}
  `;
  
  const result = await db.execute(query);
  const rows = Array.isArray(result) ? result : (result.rows ?? [result]);
  const row = rows[0] || {};
  
  const cohortSize = Number(row.cohort_size ?? row.cohortSize ?? 0);
  const rawPercentile = Number(row.percentile ?? 0);

  if (cohortSize < 20) {
    return { percentile: null, cohortSize };
  }

  return { percentile: Math.round(rawPercentile), cohortSize };
}
