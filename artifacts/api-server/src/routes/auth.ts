import { Router } from "express";
import { randomBytes } from "crypto";
import { db } from "@workspace/db";
import { usersTable, sessionsTable } from "@workspace/db";
import { eq, and, gt } from "drizzle-orm";
import { requireAuth, type AuthenticatedRequest } from "../middlewares/auth";
import { authLimiter } from "../lib/rate-limiters";

const router = Router();

const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: SESSION_DURATION_MS,
};

function getRedirectUri(req: any): string {
  if (process.env.APP_URL) return `${process.env.APP_URL}/api/auth/github/callback`;
  const domain = process.env.REPLIT_DEV_DOMAIN;
  if (domain) return `https://${domain}/api/auth/github/callback`;
  return `${req.protocol}://${req.get("host")}/api/auth/github/callback`;
}

function getFrontendUrl(path: string): string {
  if (process.env.NODE_ENV === "production") {
    return path;
  }
  return `http://localhost:8080${path}`;
}

async function createSession(userId: number): Promise<string> {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
  await db.insert(sessionsTable).values({ userId, token, expiresAt });
  return token;
}

// GET /api/auth/github — redirect to GitHub OAuth (with CSRF state)
router.get("/github", authLimiter, (req, res) => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  if (!clientId) {
    res.status(500).json({ error: "GitHub OAuth is not configured. Set GITHUB_CLIENT_ID." });
    return;
  }
  const state = randomBytes(16).toString("hex");
  res.cookie("oauth_state", state, { httpOnly: true, sameSite: "lax", maxAge: 10 * 60 * 1000 });
  const redirectUri = getRedirectUri(req);
  const scopes = "read:user user:email";
  const url = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}&state=${state}`;
  res.redirect(url);
});

// GET /api/auth/github/callback — handle OAuth callback
router.get("/github/callback", authLimiter, async (req, res) => {
  const { code, state } = req.query as { code?: string; state?: string };

  // Validate CSRF state
  const storedState = req.cookies?.oauth_state as string | undefined;
  res.clearCookie("oauth_state");
  if (!state || !storedState || state !== storedState) {
    res.redirect(getFrontendUrl("/?error=invalid_state"));
    return;
  }

  if (!code) {
    res.redirect(getFrontendUrl("/?error=missing_code"));
    return;
  }
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    res.redirect(getFrontendUrl("/?error=oauth_not_configured"));
    return;
  }

  // Exchange code for access token
  const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: getRedirectUri(req),
    }),
  });
  const tokenData = (await tokenRes.json()) as { access_token?: string; error?: string };
  if (!tokenData.access_token) {
    res.redirect(getFrontendUrl("/?error=oauth_failed"));
    return;
  }

  // Fetch GitHub user
  const ghRes = await fetch("https://api.github.com/user", {
    headers: { Authorization: `Bearer ${tokenData.access_token}`, "User-Agent": "EngineerDNA/1.0" },
  });
  if (!ghRes.ok) {
    res.redirect(getFrontendUrl("/?error=github_fetch_failed"));
    return;
  }
  const ghUser = (await ghRes.json()) as {
    id: number;
    login: string;
    name?: string;
    email?: string;
    avatar_url?: string;
  };

  // Upsert user
  const existing = await db.select().from(usersTable).where(eq(usersTable.githubId, String(ghUser.id))).limit(1);
  let userId: number;
  if (existing.length > 0) {
    userId = existing[0].id;
    await db.update(usersTable).set({
      name: ghUser.name ?? ghUser.login,
      avatarUrl: ghUser.avatar_url,
      email: ghUser.email ?? null,
      githubUsername: ghUser.login,
      updatedAt: new Date(),
    }).where(eq(usersTable.id, userId));
  } else {
    const [newUser] = await db.insert(usersTable).values({
      githubId: String(ghUser.id),
      githubUsername: ghUser.login,
      name: ghUser.name ?? ghUser.login,
      avatarUrl: ghUser.avatar_url ?? null,
      email: ghUser.email ?? null,
    }).returning();
    userId = newUser.id;
  }

  const token = await createSession(userId);
  res.cookie("session_token", token, COOKIE_OPTIONS);
  res.redirect(getFrontendUrl("/dashboard"));
});

function getGoogleRedirectUri(req: any): string {
  if (process.env.GOOGLE_REDIRECT_URI) return process.env.GOOGLE_REDIRECT_URI;
  if (process.env.APP_URL) return `${process.env.APP_URL}/api/auth/google/callback`;
  const domain = process.env.REPLIT_DEV_DOMAIN;
  if (domain) return `https://${domain}/api/auth/google/callback`;
  return `${req.protocol}://${req.get("host")}/api/auth/google/callback`;
}

// GET /api/auth/google — redirect to Google OAuth consent screen
router.get("/google", authLimiter, (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    res.status(500).json({ error: "Google OAuth is not configured. Set GOOGLE_CLIENT_ID." });
    return;
  }
  const state = randomBytes(16).toString("hex");
  res.cookie("oauth_state", state, { httpOnly: true, sameSite: "lax", maxAge: 10 * 60 * 1000 });
  const redirectUri = getGoogleRedirectUri(req);
  const scope = "openid email profile";
  const url = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&state=${state}`;
  res.redirect(url);
});

// GET /api/auth/google/callback — handle Google OAuth callback
router.get("/google/callback", authLimiter, async (req, res) => {
  const { code, state } = req.query as { code?: string; state?: string };

  const storedState = req.cookies?.oauth_state as string | undefined;
  res.clearCookie("oauth_state");
  if (!state || !storedState || state !== storedState) {
    res.redirect(getFrontendUrl("/?error=invalid_state"));
    return;
  }

  if (!code) {
    res.redirect(getFrontendUrl("/?error=missing_code"));
    return;
  }
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    res.redirect(getFrontendUrl("/?error=oauth_not_configured"));
    return;
  }

  const redirectUri = getGoogleRedirectUri(req);
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });
  const tokenData = (await tokenRes.json()) as { access_token?: string; error?: string };
  if (!tokenData.access_token) {
    res.redirect(getFrontendUrl("/?error=oauth_failed"));
    return;
  }

  const googleRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });
  if (!googleRes.ok) {
    res.redirect(getFrontendUrl("/?error=google_fetch_failed"));
    return;
  }
  const gUser = (await googleRes.json()) as {
    sub: string;
    name?: string;
    email?: string;
    picture?: string;
  };

  let existing = await db.select().from(usersTable).where(eq(usersTable.googleId, gUser.sub)).limit(1);
  if (existing.length === 0 && gUser.email) {
    existing = await db.select().from(usersTable).where(eq(usersTable.email, gUser.email)).limit(1);
  }

  let userId: number;
  if (existing.length > 0) {
    userId = existing[0].id;
    await db.update(usersTable).set({
      name: existing[0].name || gUser.name || "",
      avatarUrl: existing[0].avatarUrl || gUser.picture || null,
      email: existing[0].email || gUser.email || null,
      googleId: gUser.sub,
      updatedAt: new Date(),
    }).where(eq(usersTable.id, userId));
  } else {
    const [newUser] = await db.insert(usersTable).values({
      provider: "google",
      googleId: gUser.sub,
      name: gUser.name ?? "",
      avatarUrl: gUser.picture ?? null,
      email: gUser.email ?? null,
    }).returning();
    userId = newUser.id;
  }

  const token = await createSession(userId);
  res.cookie("session_token", token, COOKIE_OPTIONS);
  res.redirect(getFrontendUrl("/dashboard"));
});

// GET /api/auth/dev-login — development only fast login
router.get("/dev-login", async (_req, res) => {
  if (process.env.NODE_ENV !== "development") {
    res.status(404).json({ error: "Not found" });
    return;
  }
  let [user] = await db.select().from(usersTable).where(eq(usersTable.githubId, "dev-user-001")).limit(1);
  if (!user) {
    [user] = await db.insert(usersTable).values({
      githubId: "dev-user-001",
      githubUsername: "devuser",
      name: "Dev User",
      email: "dev@example.com",
      avatarUrl: "https://avatars.githubusercontent.com/u/0",
    }).returning();
  }
  const token = await createSession(user.id);
  res.cookie("session_token", token, { ...COOKIE_OPTIONS, secure: false });
  res.redirect(getFrontendUrl("/dashboard"));
});

// GET /api/auth/me — return current user
router.get("/me", requireAuth, (req, res) => {
  const { user } = req as AuthenticatedRequest;
  res.json(JSON.parse(JSON.stringify(user)));
});

// POST /api/auth/logout
router.post("/logout", requireAuth, async (req, res) => {
  const { sessionToken } = req as AuthenticatedRequest;
  await db.delete(sessionsTable).where(eq(sessionsTable.token, sessionToken));
  res.clearCookie("session_token");
  res.json({ message: "Logged out successfully" });
});

export default router;
