import * as React from "react";
import { useRoute, Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Swords, Share2, ArrowRight, Trophy, Sparkles, CheckCircle2, AlertTriangle, Code } from "lucide-react";
import { getArchetypeMeta } from "@/lib/archetypes";

interface ProfileData {
  githubUsername: string;
  overallScore: number;
  archetype: string;
  archetypeDescription: string;
  headlineStrengths: string[];
  topLanguages: string[];
  techStack: string[];
  percentile: number | null;
}

export default function ComparePage() {
  const [, params] = useRoute("/compare/:user1/:user2");
  const user1 = params?.user1;
  const user2 = params?.user2;

  const [data1, setData1] = React.useState<ProfileData | null>(null);
  const [data2, setData2] = React.useState<ProfileData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [input1, setInput1] = React.useState(user1 || "");
  const [input2, setInput2] = React.useState(user2 || "");
  const { toast } = useToast();

  const fetchComparison = React.useCallback(async (u1: string, u2: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/compare/${encodeURIComponent(u1)}/${encodeURIComponent(u2)}`);
      if (!res.ok) {
        setData1(null);
        setData2(null);
        return;
      }
      const json = await res.json();
      setData1(json.user1);
      setData2(json.user2);
    } catch (err) {
      toast({
        title: "Comparison Error",
        description: "Could not fetch public profile comparison data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    if (user1 && user2) {
      fetchComparison(user1, user2);
    } else {
      setLoading(false);
    }
  }, [user1, user2, fetchComparison]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({ title: "Comparison link copied!", description: "Share this comparison URL with friends." });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto p-4 md:p-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <Badge variant="outline" className="px-4 py-1 border-primary/30 text-primary font-mono text-xs">
          SIDE-BY-SIDE MATCHUP
        </Badge>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight font-mono flex items-center justify-center gap-3">
          Engineer Comparison <Swords className="w-8 h-8 text-primary" />
        </h1>
        <p className="text-muted-foreground text-sm max-w-lg mx-auto">
          Compare GitHub DNA scores, developer archetypes, and technical strengths head-to-head.
        </p>
      </div>

      {/* Input bar */}
      <Card className="border-border bg-card/40 backdrop-blur-xl">
        <CardContent className="p-6 flex flex-col md:flex-row items-center gap-4">
          <Input
            value={input1}
            onChange={(e) => setInput1(e.target.value)}
            placeholder="Username 1 (e.g. torvalds)"
            className="font-mono bg-background"
          />
          <span className="font-mono text-xs font-bold text-muted-foreground">VS</span>
          <Input
            value={input2}
            onChange={(e) => setInput2(e.target.value)}
            placeholder="Username 2 (e.g. gaearon)"
            className="font-mono bg-background"
          />
          <Link href={`/compare/${encodeURIComponent(input1)}/${encodeURIComponent(input2)}`}>
            <Button disabled={!input1 || !input2} className="w-full md:w-auto font-bold gap-2 shrink-0">
              Compare <Swords className="w-4 h-4" />
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Comparison View */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-96 bg-muted/30 animate-pulse rounded-2xl" />
          <div className="h-96 bg-muted/30 animate-pulse rounded-2xl" />
        </div>
      ) : user1 && user2 ? (
        <div className="space-y-6">
          <div className="flex justify-end">
            <Button onClick={handleShare} variant="outline" size="sm" className="gap-2">
              <Share2 className="w-4 h-4 text-primary" /> Share Comparison
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <UserCard data={data1} username={user1} opponentScore={data2?.overallScore} />
            <UserCard data={data2} username={user2} opponentScore={data1?.overallScore} />
          </div>
        </div>
      ) : null}
    </div>
  );
}

function UserCard({ data, username, opponentScore }: { data: ProfileData | null; username: string; opponentScore?: number }) {
  if (!data) {
    return (
      <Card className="border-border bg-card/40 p-8 text-center space-y-4">
        <AlertTriangle className="w-10 h-10 text-muted-foreground mx-auto" />
        <h3 className="font-bold text-lg">@{username} is Private or Not Found</h3>
        <p className="text-xs text-muted-foreground">
          This user has not published a public GitHub DNA scorecard yet.
        </p>
      </Card>
    );
  }

  const meta = getArchetypeMeta(data.archetype);
  const isWinner = opponentScore !== undefined && data.overallScore > opponentScore;

  return (
    <Card className={`border-border bg-card/60 relative overflow-hidden ${isWinner ? 'border-primary/50 ring-1 ring-primary/30' : ''}`}>
      {isWinner && (
        <div className="absolute top-3 right-3">
          <Badge className="bg-amber-400 text-black font-bold font-mono text-xs gap-1">
            <Trophy className="w-3 h-3" /> HIGHER SCORE
          </Badge>
        </div>
      )}

      <CardContent className="p-6 space-y-6">
        <div>
          <span className="text-xs font-mono text-muted-foreground">DEVELOPER</span>
          <h2 className="text-2xl font-bold font-mono">@{data.githubUsername}</h2>
          <p className="text-xs text-muted-foreground mt-1">{data.archetypeDescription}</p>
        </div>

        {/* Score & Archetype */}
        <div className="flex items-center gap-4 bg-background/80 border border-border p-4 rounded-xl">
          <div className="text-4xl font-extrabold font-mono text-primary">{data.overallScore}</div>
          <div className="border-l border-border pl-4">
            <div className={`text-xs font-bold ${meta.textColor}`}>{meta.name}</div>
            <div className="text-xs text-muted-foreground">
              {data.percentile !== null ? `Top ${100 - data.percentile}% Rank` : "Cohort < 20"}
            </div>
          </div>
        </div>

        {/* Headline Strengths */}
        <div className="space-y-2">
          <span className="text-xs font-semibold uppercase text-muted-foreground">Key Strengths</span>
          {data.headlineStrengths.slice(0, 3).map((s, idx) => (
            <div key={idx} className="p-2.5 rounded-lg bg-muted/40 text-xs font-medium border border-border/50">
              ⚡ {s}
            </div>
          ))}
        </div>

        {/* Languages */}
        <div className="flex flex-wrap gap-1.5 pt-2">
          {data.topLanguages.map((l) => (
            <Badge key={l} variant="secondary" className="font-mono text-xs">
              {l}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
