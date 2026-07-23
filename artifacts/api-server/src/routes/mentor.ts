import { Router } from "express";
import { z } from "zod";
import { db } from "@workspace/db";
import { mentorSessionsTable, mentorMessagesTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth, type AuthenticatedRequest } from "../middlewares/auth";
import { gemini } from "../lib/ai";

const router = Router();

// ── Zod Schemas ───────────────────────────────────────────────────────────────
const createSessionSchema = z.object({
  topic: z.string().min(1, "topic is required").max(200, "Topic cannot exceed 200 characters"),
  firstMessage: z.string().min(1, "firstMessage is required").max(5000, "Message cannot exceed 5,000 characters"),
});

const sendMessageSchema = z.object({
  content: z.string().min(1, "content is required").max(5000, "Message cannot exceed 5,000 characters"),
});

// GET /api/mentor/sessions
router.get("/sessions", requireAuth, async (req, res) => {
  const { user } = req as AuthenticatedRequest;
  const sessions = await db
    .select()
    .from(mentorSessionsTable)
    .where(eq(mentorSessionsTable.userId, user.id))
    .orderBy(desc(mentorSessionsTable.updatedAt));
  res.json(JSON.parse(JSON.stringify(sessions)));
});

// POST /api/mentor/sessions — create session + send first message
router.post("/sessions", requireAuth, async (req, res) => {
  const { user } = req as AuthenticatedRequest;

  // FIX: Validate inputs with Zod
  const parsed = createSessionSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input", details: parsed.error.flatten().fieldErrors });
    return;
  }

  const { topic, firstMessage } = parsed.data;

  const [session] = await db
    .insert(mentorSessionsTable)
    .values({ userId: user.id, title: topic.slice(0, 100), topic, messageCount: 0 })
    .returning();

  // Store user message
  await db.insert(mentorMessagesTable).values({ sessionId: session.id, role: "user", content: firstMessage });

  // Get AI response
  let aiContent = "I'm here to help. Tell me more about what you're working on.";
  try {
    const response = await gemini.models.generateContent({
      model: "gemini-2.5-flash",
      contents: firstMessage,
      config: {
        systemInstruction: `You are an expert AI engineering mentor with 20+ years of experience. You give precise, honest, and actionable guidance to software engineers. You ask clarifying questions when needed. Topic: ${topic}`,
      },
    });
    aiContent = response.text ?? aiContent;
  } catch (err) {
    // FIX: Log details server-side only
    console.error("[mentor] AI response error on session create:", err);
    // Continue — we'll store the fallback message so the session isn't left incomplete
  }

  await db.insert(mentorMessagesTable).values({ sessionId: session.id, role: "assistant", content: aiContent });

  // Update message count
  const [updatedSession] = await db
    .update(mentorSessionsTable)
    .set({ messageCount: 2, updatedAt: new Date() })
    .where(eq(mentorSessionsTable.id, session.id))
    .returning();

  res.status(201).json(JSON.parse(JSON.stringify(updatedSession)));
});

// GET /api/mentor/sessions/:id — session + messages
router.get("/sessions/:id", requireAuth, async (req, res) => {
  const { user } = req as AuthenticatedRequest;
  const id = parseInt(req.params.id as string, 10);

  const [session] = await db.select().from(mentorSessionsTable).where(eq(mentorSessionsTable.id, id)).limit(1);
  if (!session || session.userId !== user.id) {
    res.status(404).json({ error: "Session not found" });
    return;
  }

  const messages = await db
    .select()
    .from(mentorMessagesTable)
    .where(eq(mentorMessagesTable.sessionId, id))
    .orderBy(mentorMessagesTable.createdAt);

  res.json(JSON.parse(JSON.stringify({ ...session, messages })));
});

// POST /api/mentor/sessions/:id/messages — send message
router.post("/sessions/:id/messages", requireAuth, async (req, res) => {
  const { user } = req as AuthenticatedRequest;
  const id = parseInt(req.params.id as string, 10);

  // FIX: Validate message content with Zod
  const parsed = sendMessageSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input", details: parsed.error.flatten().fieldErrors });
    return;
  }

  const { content } = parsed.data;

  const [session] = await db.select().from(mentorSessionsTable).where(eq(mentorSessionsTable.id, id)).limit(1);
  if (!session || session.userId !== user.id) {
    res.status(404).json({ error: "Session not found" });
    return;
  }

  // Store user message
  await db.insert(mentorMessagesTable).values({ sessionId: id, role: "user", content: content.trim() });

  // Build conversation history for context (last 20 messages)
  const history = await db
    .select()
    .from(mentorMessagesTable)
    .where(eq(mentorMessagesTable.sessionId, id))
    .orderBy(mentorMessagesTable.createdAt);

  const messages = history.slice(-20).map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

  let aiContent = "Let me think about that...";
  try {
    const response = await gemini.models.generateContent({
      model: "gemini-2.5-flash",
      contents: messages.map(m => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }]
      })),
      config: {
        systemInstruction: `You are an expert AI engineering mentor with 20+ years of experience. You give precise, honest, and actionable guidance. Session topic: ${session.topic}`,
      },
    });
    aiContent = response.text ?? aiContent;
  } catch (err) {
    // FIX: Log details server-side only
    console.error("[mentor] AI response error on send message:", err);
    // Continue with fallback — don't leave user message without a response
  }

  const [aiMessage] = await db
    .insert(mentorMessagesTable)
    .values({ sessionId: id, role: "assistant", content: aiContent })
    .returning();

  // Update session
  await db
    .update(mentorSessionsTable)
    .set({ messageCount: history.length + 1, updatedAt: new Date() })
    .where(eq(mentorSessionsTable.id, id));

  res.status(201).json(JSON.parse(JSON.stringify(aiMessage)));
});

export default router;
