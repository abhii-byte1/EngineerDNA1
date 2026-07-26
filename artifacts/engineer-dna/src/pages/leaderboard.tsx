import * as React from "react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Trophy, Sparkles, Shield, ArrowRight, UserPlus, Filter } from "lucide-react";
import { getArchetypeMeta } from "@/lib/archetypes";

import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/animations";

interface LeaderboardItem {
  id: number;
  githubUsername: string;
  overallScore: number;
  archetype: string;
  archetypeDescription: string;
  topLanguages: string[];
  track: string;
  level: string;
  percentile: number | null;
  cohortSize: number;
}

export default function LeaderboardPage() {
  const [track, setTrack] = React.useState<string>("all");
  const [level, setLevel] = React.useState<string>("all");
  const [items, setItems] = React.useState<LeaderboardItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { toast } = useToast();

  const fetchLeaderboard = React.useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (track !== "all") params.append("track", track);
      if (level !== "all") params.append("level", level);

      const res = await fetch(`/api/leaderboard?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load leaderboard");
      const data = await res.json();
      setItems(data);
    } catch (err) {
      toast({
        title: "Leaderboard Error",
        description: err instanceof Error ? err.message : "Could not fetch leaderboard data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [track, level, toast]);

  React.useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Trophy className="w-8 h-8 text-amber-400" />
            <h1 className="text-3xl font-bold tracking-tight">EngineerDNA Leaderboard</h1>
          </div>
          <p className="text-muted-foreground text-sm">
            Percentile-ranked benchmark of verified public GitHub engineering scores.
          </p>
        </div>

        <Link href="/github-dna">
          <Button className="gap-2 font-semibold">
            <UserPlus className="w-4 h-4" /> Join Leaderboard
          </Button>
        </Link>
      </div>

      {/* Filter Bar */}
      <Card className="border-border bg-card/40 backdrop-blur-xl">
        <CardContent className="p-4 flex flex-col sm:flex-row items-center gap-4">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground shrink-0">
            <Filter className="w-4 h-4 text-primary" /> Filter Cohort:
          </div>

          <div className="flex flex-wrap gap-4 w-full">
            <Select value={track} onValueChange={setTrack}>
              <SelectTrigger className="w-48 bg-background">
                <SelectValue placeholder="All Tracks" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tracks</SelectItem>
                <SelectItem value="Full Stack">Full Stack</SelectItem>
                <SelectItem value="Backend">Backend</SelectItem>
                <SelectItem value="Frontend">Frontend</SelectItem>
                <SelectItem value="DevOps">DevOps</SelectItem>
                <SelectItem value="Systems">Systems</SelectItem>
              </SelectContent>
            </Select>

            <Select value={level} onValueChange={setLevel}>
              <SelectTrigger className="w-48 bg-background">
                <SelectValue placeholder="All Experience Levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="junior">Junior</SelectItem>
                <SelectItem value="mid">Mid</SelectItem>
                <SelectItem value="senior">Senior</SelectItem>
                <SelectItem value="staff">Staff / Principal</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Leaderboard Table */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((n) => (
            <div key={n} className="h-20 bg-muted/40 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <Card className="text-center p-12 border-border bg-card/40">
          <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-lg font-bold">No Public Leaderboard Entries Yet</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
            Be the first engineer to publish your score to this cohort leaderboard!
          </p>
          <Link href="/github-dna">
            <Button variant="outline" className="mt-4 gap-2">
              Publish Your Score <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </Card>
      ) : (
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-3">
          {items.map((item, idx) => {
            const meta = getArchetypeMeta(item.archetype);
            const rank = idx + 1;

            return (
              <motion.div key={item.id} variants={staggerItem}>
                <Card
                  className="border-border/80 bg-card/60 hover:border-primary/40 transition-all overflow-hidden"
                >
                <CardContent className="p-4 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    {/* Rank Badge */}
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-mono font-bold text-sm shrink-0 ${
                        rank === 1
                          ? "bg-amber-400/20 text-amber-400 border border-amber-400/30"
                          : rank === 2
                          ? "bg-slate-300/20 text-slate-300 border border-slate-300/30"
                          : rank === 3
                          ? "bg-amber-600/20 text-amber-600 border border-amber-600/30"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      #{rank}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-3">
                        <Link href={`/u/${item.githubUsername}`}>
                          <span className="font-mono font-bold text-lg hover:text-primary transition-colors cursor-pointer truncate">
                            @{item.githubUsername}
                          </span>
                        </Link>
                        <Badge variant="outline" className={`font-mono text-xs ${meta.badgeBg}`}>
                          {meta.name}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2 mt-1 font-mono text-xs text-muted-foreground">
                        <span>{item.track}</span>
                        <span>•</span>
                        <span className="capitalize">{item.level}</span>
                        <span>•</span>
                        <span>{item.topLanguages?.slice(0, 3).join(", ")}</span>
                      </div>
                    </div>
                  </div>

                  {/* Score & Percentile */}
                  <div className="flex items-center gap-6 shrink-0 self-end md:self-center">
                    <div className="text-right">
                      <div className="text-xs font-semibold text-muted-foreground">PERCENTILE</div>
                      <div className="text-sm font-bold text-amber-400 font-mono">
                        {item.percentile !== null ? `Top ${100 - item.percentile}%` : "N/A"}
                      </div>
                    </div>

                    <div className="text-right bg-background/80 border border-border px-4 py-2 rounded-xl">
                      <div className="text-xs font-semibold text-muted-foreground">SCORE</div>
                      <div className="text-2xl font-bold font-mono text-primary">{item.overallScore}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>
      )}
    </div>
  );
}
