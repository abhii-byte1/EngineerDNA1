import type { Request, Response, NextFunction } from "express";
import { db, sessionsTable, usersTable } from "@workspace/db";
import { eq, and, gt } from "drizzle-orm";
import type { AuthenticatedRequest } from "./auth";

export async function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const sessionToken = req.cookies?.session_token as string | undefined;
  if (!sessionToken) {
    (req as Partial<AuthenticatedRequest>).user = undefined;
    return next();
  }

  try {
    const [session] = await db
      .select()
      .from(sessionsTable)
      .where(and(eq(sessionsTable.token, sessionToken), gt(sessionsTable.expiresAt, new Date())))
      .limit(1);

    if (session) {
      const [user] = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.id, session.userId))
        .limit(1);

      if (user) {
        (req as AuthenticatedRequest).user = user;
        (req as AuthenticatedRequest).sessionToken = sessionToken;
      } else {
        (req as Partial<AuthenticatedRequest>).user = undefined;
      }
    } else {
      (req as Partial<AuthenticatedRequest>).user = undefined;
    }
  } catch {
    // Any failure (expired, malformed, DB error) -> treat as unauthenticated
    (req as Partial<AuthenticatedRequest>).user = undefined;
  }
  next();
}
