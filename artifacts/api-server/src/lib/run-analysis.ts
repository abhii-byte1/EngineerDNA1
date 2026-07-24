import { db } from "@workspace/db";
import { gemini } from "./ai";
import { eq } from "drizzle-orm";

export async function runAnalysis<T extends { id: number }>(opts: {
  table: any; // PgTable reference
  insertValues: Record<string, unknown>;
  buildPrompt: () => string | Promise<{ prompt: string; context?: any }> | Promise<string>;
  systemInstruction: string;
  mapResult: (analysis: Record<string, unknown>, context?: any) => Record<string, unknown>;
}): Promise<{ row: T; analysis: Record<string, unknown> }> {
  // 1. Insert initial row (e.g. pending/analyzing state)
  const insertRes = await db
    .insert(opts.table)
    .values(opts.insertValues)
    .returning();
  const report = Array.isArray(insertRes) ? insertRes[0] : (insertRes as any)[0];

  try {
    // 2. Build prompt
    const promptResult = await opts.buildPrompt();
    const prompt = typeof promptResult === "string" ? promptResult : promptResult.prompt;
    const context = typeof promptResult === "string" ? undefined : promptResult.context;

    // 3. Call model
    const response = await gemini.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        systemInstruction: opts.systemInstruction,
      },
    });

    const analysis = JSON.parse(response.text ?? "{}") as Record<string, unknown>;
    
    // 4. Map results to table schema
    const mappedUpdates = opts.mapResult(analysis, context);

    // 5. Update row with completed data
    const [updated] = await db
      .update(opts.table)
      .set(mappedUpdates)
      .where(eq(opts.table.id, report.id))
      .returning();

    return { row: updated as T, analysis };
  } catch (err) {
    console.error("[run-analysis] error:", err);
    // If the table supports it, mark as failed
    try {
      await db.update(opts.table).set({ status: "failed" }).where(eq(opts.table.id, report.id));
    } catch {
      // Ignore if table lacks status column (e.g. roadmaps)
    }
    throw new Error("Analysis failed. Please try again.");
  }
}
