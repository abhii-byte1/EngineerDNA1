import { Router } from "express";
import { 
  db, 
  usersTable, 
  githubReportsTable, 
  resumeReportsTable, 
  roadmapsTable, 
  interviewSessionsTable,
  adminAuditLogTable,
  feedbackTable
} from "@workspace/db";
import { eq, gte, and, count, desc, sql } from "drizzle-orm";
import { requireAuth, type AuthenticatedRequest } from "../middlewares/auth";
import { requireAdmin } from "../middlewares/require-admin";
import { adminLimiter } from "../lib/rate-limiters";

const router = Router();

// Apply auth, admin role check, and rate limiting to all admin endpoints
router.use(requireAuth, requireAdmin, adminLimiter);

// Helper function to insert into admin_audit_log
async function logAdminAction(adminUserId: number, action: string, targetUserId?: number, metadata?: Record<string, any>) {
  try {
    await db.insert(adminAuditLogTable).values({
      adminUserId,
      action,
      targetUserId: targetUserId ?? null,
      metadata: metadata ?? null,
    });
  } catch (err) {
    console.error("[admin-audit] failed to write audit log:", err);
  }
}

// GET /api/admin/stats/overview — User counts, signups, DAU/WAU/MAU
router.get("/stats/overview", async (req, res) => {
  const adminUser = (req as AuthenticatedRequest).user;
  await logAdminAction(adminUser.id, "view_overview_stats");

  const now = new Date();
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [[totalUserRow], [daySignupRow], [weekSignupRow], [monthSignupRow], [dauRow], [wauRow], [mauRow]] = await Promise.all([
    db.select({ count: count() }).from(usersTable),
    db.select({ count: count() }).from(usersTable).where(gte(usersTable.createdAt, dayAgo)),
    db.select({ count: count() }).from(usersTable).where(gte(usersTable.createdAt, weekAgo)),
    db.select({ count: count() }).from(usersTable).where(gte(usersTable.createdAt, monthAgo)),
    db.select({ count: count() }).from(usersTable).where(gte(usersTable.lastActiveAt, dayAgo)),
    db.select({ count: count() }).from(usersTable).where(gte(usersTable.lastActiveAt, weekAgo)),
    db.select({ count: count() }).from(usersTable).where(gte(usersTable.lastActiveAt, monthAgo)),
  ]);

  res.json({
    totalUsers: totalUserRow.count,
    signups: {
      past24h: daySignupRow.count,
      past7d: weekSignupRow.count,
      past30d: monthSignupRow.count,
    },
    activeUsers: {
      dau: dauRow.count,
      wau: wauRow.count,
      mau: mauRow.count,
    },
  });
});

// GET /api/admin/stats/modules — Per-module usage metrics
router.get("/stats/modules", async (req, res) => {
  const adminUser = (req as AuthenticatedRequest).user;
  await logAdminAction(adminUser.id, "view_module_stats");

  const [
    [ghCompletedRow],
    [ghFailedRow],
    [resumeCompletedRow],
    [roadmapRow],
    [interviewRow],
  ] = await Promise.all([
    db.select({ count: count() }).from(githubReportsTable).where(eq(githubReportsTable.status, "completed")),
    db.select({ count: count() }).from(githubReportsTable).where(eq(githubReportsTable.status, "failed")),
    db.select({ count: count() }).from(resumeReportsTable).where(eq(resumeReportsTable.status, "completed")),
    db.select({ count: count() }).from(roadmapsTable),
    db.select({ count: count() }).from(interviewSessionsTable),
  ]);

  res.json({
    githubDna: {
      completed: ghCompletedRow.count,
      failed: ghFailedRow.count,
    },
    resumeDna: {
      completed: resumeCompletedRow.count,
    },
    roadmaps: {
      generated: roadmapRow.count,
    },
    interviewSimulator: {
      totalSessions: interviewRow.count,
    },
  });
});

// GET /api/admin/stats/growth-engine — Public profiles, leaderboard opt-ins
router.get("/stats/growth-engine", async (req, res) => {
  const adminUser = (req as AuthenticatedRequest).user;
  await logAdminAction(adminUser.id, "view_growth_engine_stats");

  const [[publicProfilesRow], [leaderboardOptInsRow]] = await Promise.all([
    db.select({ count: count() }).from(githubReportsTable).where(eq(githubReportsTable.isPublic, true)),
    db.select({ count: count() }).from(githubReportsTable).where(and(eq(githubReportsTable.isPublic, true), eq(githubReportsTable.leaderboardOptIn, true))),
  ]);

  res.json({
    totalPublicProfiles: publicProfilesRow.count,
    leaderboardOptIns: leaderboardOptInsRow.count,
  });
});

// GET /api/admin/stats/errors — Recent 50 failed analyses
router.get("/stats/errors", async (req, res) => {
  const adminUser = (req as AuthenticatedRequest).user;
  await logAdminAction(adminUser.id, "view_error_logs");

  const failedReports = await db
    .select({
      id: githubReportsTable.id,
      userId: githubReportsTable.userId,
      githubUsername: githubReportsTable.githubUsername,
      status: githubReportsTable.status,
      createdAt: githubReportsTable.createdAt,
    })
    .from(githubReportsTable)
    .where(eq(githubReportsTable.status, "failed"))
    .orderBy(desc(githubReportsTable.createdAt))
    .limit(50);

  res.json(failedReports);
});

// GET /api/admin/stats/feedback — Feedback ratios & recent comments
router.get("/stats/feedback", async (req, res) => {
  const adminUser = (req as AuthenticatedRequest).user;
  await logAdminAction(adminUser.id, "view_feedback_stats");

  const items = await db
    .select()
    .from(feedbackTable)
    .orderBy(desc(feedbackTable.createdAt))
    .limit(50);

  const [[upRow], [downRow]] = await Promise.all([
    db.select({ count: count() }).from(feedbackTable).where(eq(feedbackTable.rating, "up")),
    db.select({ count: count() }).from(feedbackTable).where(eq(feedbackTable.rating, "down")),
  ]);

  res.json({
    summary: {
      up: upRow.count,
      down: downRow.count,
      total: upRow.count + downRow.count,
    },
    recentComments: items,
  });
});

// GET /api/admin/users — Paginated aggregate user summary
router.get("/users", async (req, res) => {
  const adminUser = (req as AuthenticatedRequest).user;
  const page = Math.max(1, parseInt(req.query.page as string || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string || "50", 10)));
  const offset = (page - 1) * limit;

  await logAdminAction(adminUser.id, "view_users_list", undefined, { page, limit });

  const [users, [totalRow]] = await Promise.all([
    db
      .select({
        id: usersTable.id,
        email: usersTable.email,
        githubUsername: usersTable.githubUsername,
        name: usersTable.name,
        avatarUrl: usersTable.avatarUrl,
        role: usersTable.role,
        createdAt: usersTable.createdAt,
        lastActiveAt: usersTable.lastActiveAt,
        emailNotificationsOptIn: usersTable.emailNotificationsOptIn,
      })
      .from(usersTable)
      .orderBy(desc(usersTable.createdAt))
      .limit(limit)
      .offset(offset),
    db.select({ count: count() }).from(usersTable),
  ]);

  res.json({
    users,
    pagination: {
      page,
      limit,
      totalUsers: totalRow.count,
      totalPages: Math.ceil(totalRow.count / limit),
    },
  });
});

export default router;
