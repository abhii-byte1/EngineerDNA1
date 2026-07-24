import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  Activity, 
  AlertTriangle, 
  TrendingUp, 
  Shield, 
  FileText, 
  Github, 
  Globe, 
  MessageSquare, 
  ThumbsUp, 
  ThumbsDown,
  ChevronLeft,
  ChevronRight,
  RefreshCw
} from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

interface OverviewStats {
  totalUsers: number;
  signups: { past24h: number; past7d: number; past30d: number };
  activeUsers: { dau: number; wau: number; mau: number };
}

interface ModuleStats {
  githubDna: { completed: number; failed: number };
  resumeDna: { completed: number };
  roadmaps: { generated: number };
  interviewSimulator: { totalSessions: number };
}

interface GrowthStats {
  totalPublicProfiles: number;
  leaderboardOptIns: number;
}

interface ErrorLog {
  id: number;
  userId: number | null;
  githubUsername: string;
  status: string;
  errorMessage: string | null;
  createdAt: string;
}

interface FeedbackStats {
  summary: { up: number; down: number; total: number };
  recentComments: Array<{
    id: number;
    userId: number | null;
    context: string;
    contextId: string | null;
    rating: string | null;
    comment: string | null;
    createdAt: string;
  }>;
}

interface AdminUser {
  id: number;
  email: string | null;
  githubUsername: string | null;
  name: string;
  role: string;
  createdAt: string;
  lastActiveAt: string | null;
  emailNotificationsOptIn: boolean;
}

export default function AdminPage() {
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(true);
  const [unauthorized, setUnauthorized] = React.useState(false);

  const [overview, setOverview] = React.useState<OverviewStats | null>(null);
  const [modules, setModules] = React.useState<ModuleStats | null>(null);
  const [growth, setGrowth] = React.useState<GrowthStats | null>(null);
  const [errors, setErrors] = React.useState<ErrorLog[]>([]);
  const [feedback, setFeedback] = React.useState<FeedbackStats | null>(null);

  const [users, setUsers] = React.useState<AdminUser[]>([]);
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);

  const fetchAdminData = React.useCallback(async () => {
    setLoading(true);
    setUnauthorized(false);

    try {
      const [resOverview, resModules, resGrowth, resErrors, resFeedback, resUsers] = await Promise.all([
        fetch("/api/admin/stats/overview"),
        fetch("/api/admin/stats/modules"),
        fetch("/api/admin/stats/growth-engine"),
        fetch("/api/admin/stats/errors"),
        fetch("/api/admin/stats/feedback"),
        fetch(`/api/admin/users?page=${page}&limit=25`),
      ]);

      if (resOverview.status === 404 || resOverview.status === 403) {
        setUnauthorized(true);
        setLoading(false);
        return;
      }

      const [jsonOverview, jsonModules, jsonGrowth, jsonErrors, jsonFeedback, jsonUsers] = await Promise.all([
        resOverview.json(),
        resModules.json(),
        resGrowth.json(),
        resErrors.json(),
        resFeedback.json(),
        resUsers.json(),
      ]);

      setOverview(jsonOverview);
      setModules(jsonModules);
      setGrowth(jsonGrowth);
      setErrors(jsonErrors);
      setFeedback(jsonFeedback);
      setUsers(jsonUsers.users || []);
      setTotalPages(jsonUsers.pagination?.totalPages || 1);
    } catch (err) {
      toast({ title: "Admin load error", description: "Failed to fetch admin metrics", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [page, toast]);

  React.useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  if (unauthorized) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center p-8 space-y-4">
          <Shield className="w-12 h-12 text-destructive mx-auto" />
          <h2 className="text-xl font-bold">404 Not Found</h2>
          <p className="text-sm text-muted-foreground">The requested page does not exist.</p>
        </Card>
      </div>
    );
  }

  const moduleChartData = modules ? [
    { name: "GitHub DNA", count: modules.githubDna.completed },
    { name: "Resume DNA", count: modules.resumeDna.completed },
    { name: "Roadmaps", count: modules.roadmaps.generated },
    { name: "Interviews", count: modules.interviewSimulator.totalSessions },
  ] : [];

  return (
    <div className="space-y-8 max-w-6xl mx-auto p-4 md:p-8 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="destructive" className="font-mono text-xs uppercase">ADMIN PANEL</Badge>
            <span className="text-xs font-mono text-muted-foreground">Internal Operational Insights</span>
          </div>
          <h1 className="text-3xl font-bold font-mono tracking-tight">System Telemetry & Controls</h1>
        </div>

        <Button onClick={fetchAdminData} disabled={loading} variant="outline" size="sm" className="gap-2 font-mono text-xs">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh Stats
        </Button>
      </div>

      {/* 1. Overview Cards */}
      {overview && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-card/60 border-border">
            <CardContent className="p-5">
              <div className="flex items-center justify-between text-muted-foreground mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Total Users</span>
                <Users className="w-4 h-4 text-primary" />
              </div>
              <div className="text-3xl font-bold font-mono">{overview.totalUsers}</div>
              <p className="text-xs text-muted-foreground mt-1">+{overview.signups.past24h} in past 24h</p>
            </CardContent>
          </Card>

          <Card className="bg-card/60 border-border">
            <CardContent className="p-5">
              <div className="flex items-center justify-between text-muted-foreground mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Active Users (DAU)</span>
                <Activity className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-3xl font-bold font-mono text-emerald-400">{overview.activeUsers.dau}</div>
              <p className="text-xs text-muted-foreground mt-1">WAU: {overview.activeUsers.wau} | MAU: {overview.activeUsers.mau}</p>
            </CardContent>
          </Card>

          <Card className="bg-card/60 border-border">
            <CardContent className="p-5">
              <div className="flex items-center justify-between text-muted-foreground mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Public Scorecards</span>
                <Globe className="w-4 h-4 text-secondary" />
              </div>
              <div className="text-3xl font-bold font-mono">{growth?.totalPublicProfiles ?? 0}</div>
              <p className="text-xs text-muted-foreground mt-1">{growth?.leaderboardOptIns ?? 0} opted into leaderboard</p>
            </CardContent>
          </Card>

          <Card className="bg-card/60 border-border">
            <CardContent className="p-5">
              <div className="flex items-center justify-between text-muted-foreground mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Feedback Ratio</span>
                <ThumbsUp className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-3xl font-bold font-mono text-amber-400">
                {feedback ? `${Math.round((feedback.summary.up / (feedback.summary.total || 1)) * 100)}%` : "N/A"}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                👍 {feedback?.summary.up ?? 0} | 👎 {feedback?.summary.down ?? 0}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 2. Charts & Module Usage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border bg-card/60 p-6 space-y-4">
          <h3 className="font-bold text-base font-mono flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" /> Module Usage Breakdown
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={moduleChartData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={12} />
                <YAxis stroke="#94A3B8" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: "#0F172A", borderColor: "#334155" }} />
                <Bar dataKey="count" fill="#6366F1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Feedback comments section */}
        <Card className="border-border bg-card/60 p-6 space-y-4">
          <h3 className="font-bold text-base font-mono flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-amber-400" /> Recent User Feedback
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
            {feedback?.recentComments && feedback.recentComments.length > 0 ? (
              feedback.recentComments.map((item) => (
                <div key={item.id} className="p-3 rounded-lg bg-muted/40 border border-border/50 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-muted-foreground uppercase">{item.context}</span>
                    <Badge variant={item.rating === "up" ? "default" : "destructive"} className="text-[10px] px-2 py-0">
                      {item.rating === "up" ? "👍 Up" : "👎 Down"}
                    </Badge>
                  </div>
                  {item.comment && <p className="text-foreground">{item.comment}</p>}
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground">No user feedback logged yet.</p>
            )}
          </div>
        </Card>
      </div>

      {/* 3. Error Log Table */}
      <Card className="border-border bg-card/60 p-6 space-y-4">
        <h3 className="font-bold text-base font-mono flex items-center gap-2 text-destructive">
          <AlertTriangle className="w-4 h-4" /> Recent System Errors (Last 50)
        </h3>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-mono text-xs">Time</TableHead>
                <TableHead className="font-mono text-xs">Target Username</TableHead>
                <TableHead className="font-mono text-xs">Status</TableHead>
                <TableHead className="font-mono text-xs">Error Message</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {errors.length > 0 ? (
                errors.map((err) => (
                  <TableRow key={err.id}>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {new Date(err.createdAt).toLocaleTimeString()}
                    </TableCell>
                    <TableCell className="font-mono text-xs font-semibold">@{err.githubUsername}</TableCell>
                    <TableCell>
                      <Badge variant="destructive" className="font-mono text-[10px]">FAILED</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-destructive max-w-xs truncate">
                      {err.errorMessage || "Unknown analysis failure"}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-xs text-muted-foreground py-4">
                    No system errors logged.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* 4. Paginated User List */}
      <Card className="border-border bg-card/60 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base font-mono flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" /> Registered Users List
          </h3>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="font-mono text-xs text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <Button
              size="sm"
              variant="outline"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-mono text-xs">ID</TableHead>
                <TableHead className="font-mono text-xs">Name / Username</TableHead>
                <TableHead className="font-mono text-xs">Email</TableHead>
                <TableHead className="font-mono text-xs">Role</TableHead>
                <TableHead className="font-mono text-xs">Joined</TableHead>
                <TableHead className="font-mono text-xs">Last Active</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">#{u.id}</TableCell>
                  <TableCell className="font-mono text-xs font-semibold">
                    {u.name} {u.githubUsername ? `(@${u.githubUsername})` : ""}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{u.email || "N/A"}</TableCell>
                  <TableCell>
                    <Badge variant={u.role === "admin" ? "default" : "outline"} className="font-mono text-[10px]">
                      {u.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {u.lastActiveAt ? new Date(u.lastActiveAt).toLocaleDateString() : "Never"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
