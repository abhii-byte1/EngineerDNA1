import type { Request, Response, NextFunction } from "express";
import { db } from "@workspace/db";
import { sessionsTable, usersTable } from "@workspace/db";
import { eq, and, gt } from "drizzle-orm";

export type AuthUser = typeof usersTable.$inferSelect;

export type AuthenticatedRequest = Request & {
  user: AuthUser;
  sessionToken: string;
};

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.session_token as string | undefined;
  if (!token) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const [session] = await db
      .select()
      .from(sessionsTable)
      .where(and(eq(sessionsTable.token, token), gt(sessionsTable.expiresAt, new Date())))
      .limit(1);

    if (!session) {
      res.status(401).json({ error: "Session expired or invalid" });
      return;
    }

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, session.userId))
      .limit(1);

    if (!user) {
      res.status(401).json({ error: "User not found" });
      return;
    }

    (req as AuthenticatedRequest).user = user;
    (req as AuthenticatedRequest).sessionToken = token;

    // Update lastActiveAt lightweight timestamp (throttled to max once per 5 min per user)
    const now = new Date();
    if (!user.lastActiveAt || now.getTime() - new Date(user.lastActiveAt).getTime() > 5 * 60 * 1000) {
      db.update(usersTable)
        .set({ lastActiveAt: now })
        .where(eq(usersTable.id, user.id))
        .catch((err) => console.error("[auth] failed to update lastActiveAt:", err));
    }

    next();
  } catch (err) {
    // FIX: Log details server-side only — never expose internal errors to client
    console.error("[auth] middleware error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
