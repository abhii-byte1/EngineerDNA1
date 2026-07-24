import * as React from "react";
import { useRoute, Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Github, 
  Share2, 
  Sparkles, 
  Trophy, 
  CheckCircle2, 
  ArrowRight,
  Shield,
  Zap,
  Moon,
  Globe,
  Layers,
  Cpu,
  Code
} from "lucide-react";
import { getArchetypeMeta } from "@/lib/archetypes";

interface PublicProfileData {
  githubUsername: string;
  overallScore: number;
  archetype: string;
  archetypeDescription: string;
  headlineStrengths: string[];
  topLanguages: string[];
  techStack: string[];
  percentile: number | null;
  cohortSize: number;
  updatedAt: string;
}

export default function PublicProfile() {
  const [, params] = useRoute("/u/:username");
  const username = params?.username;
  const { toast } = useToast();

  const [data, setData] = React.useState<PublicProfileData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!username) return;
    setLoading(true);
    setError(null);

    fetch(`/api/public/${encodeURIComponent(username)}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("This profile is either private or does not exist.");
        }
        return res.json();
      })
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [username]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link copied!",
      description: "Public scorecard URL copied to clipboard.",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
        <div className="text-center space-y-4 animate-pulse">
          <div className="w-16 h-16 rounded-full bg-primary/20 mx-auto flex items-center justify-center">
            <Github className="w-8 h-8 text-primary animate-spin" />
          </div>
          <p className="text-muted-foreground font-mono">Loading scorecard...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-border bg-card/60 backdrop-blur-xl text-center p-8">
          <div className="w-12 h-12 rounded-full bg-destructive/10 text-destructive mx-auto flex items-center justify-center mb-4">
            <Shield className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold mb-2">Profile Not Available</h2>
          <p className="text-sm text-muted-foreground mb-6">
            This scorecard is either set to private by the owner or has not been created yet.
          </p>
          <Link href="/roast">
            <Button className="w-full">
              Get Your Own Scorecard <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const meta = getArchetypeMeta(data.archetype);

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-12 flex flex-col items-center justify-center">
      <div className="max-w-3xl w-full space-y-8 animate-in fade-in zoom-in-95 duration-500">
        {/* Header card */}
        <div className="relative rounded-2xl border border-border bg-card/40 backdrop-blur-2xl p-8 overflow-hidden shadow-2xl">
          {/* Subtle background glow */}
          <div className={`absolute -top-24 -right-24 w-72 h-72 rounded-full bg-gradient-to-br ${meta.gradient} opacity-20 blur-3xl`} />

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="font-mono text-xs text-muted-foreground tracking-widest uppercase">ENGINEER DNA SCORECARD</span>
                <Badge variant="outline" className="font-mono text-xs border-primary/30 text-primary">
                  VERIFIED SNAPSHOT
                </Badge>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight font-mono">@{data.githubUsername}</h1>
              <p className="text-sm text-muted-foreground mt-1">{data.archetypeDescription}</p>
            </div>

            <Button onClick={handleShare} variant="outline" className="gap-2 shrink-0 border-border hover:bg-primary/10">
              <Share2 className="w-4 h-4 text-primary" /> Share Scorecard
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 pt-8 border-t border-border/60">
            {/* Overall score hero */}
            <div className="flex items-center gap-4 bg-card/80 border border-border/80 rounded-xl p-5">
              <div className="text-4xl font-extrabold font-mono tracking-tighter text-primary">{data.overallScore}</div>
              <div>
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Overall Score</div>
                <div className="text-xs text-muted-foreground">Top GitHub Analysis</div>
              </div>
            </div>

            {/* Archetype badge */}
            <div className={`flex items-center gap-3 border rounded-xl p-5 ${meta.badgeBg}`}>
              <Sparkles className="w-6 h-6 shrink-0" />
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider opacity-80">Archetype</div>
                <div className="text-sm font-bold truncate">{meta.name}</div>
              </div>
            </div>

            {/* Real SQL Percentile */}
            <div className="flex items-center gap-4 bg-card/80 border border-border/80 rounded-xl p-5">
              <Trophy className="w-6 h-6 text-amber-400 shrink-0" />
              <div>
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Percentile</div>
                <div className="text-sm font-bold">
                  {data.percentile !== null ? `Top ${100 - data.percentile}%` : "Cohort < 20"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Headline strengths & Tech stack */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-border bg-card/40 backdrop-blur-xl">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" /> Headline Strengths
              </h3>
              <div className="space-y-2">
                {data.headlineStrengths.length > 0 ? (
                  data.headlineStrengths.map((str, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-muted/40 border border-border/60 text-sm font-medium">
                      {str}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">High code velocity & modular commit structure.</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card/40 backdrop-blur-xl">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Code className="w-4 h-4 text-primary" /> Top Languages & Stack
              </h3>
              <div className="flex flex-wrap gap-2">
                {data.topLanguages.map((lang) => (
                  <Badge key={lang} variant="secondary" className="px-3 py-1 text-xs font-mono">
                    {lang}
                  </Badge>
                ))}
                {data.techStack.map((tech) => (
                  <Badge key={tech} variant="outline" className="px-3 py-1 text-xs font-mono border-primary/20 text-primary">
                    {tech}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Call to action footer */}
        <div className="text-center p-8 rounded-2xl border border-primary/20 bg-gradient-to-b from-primary/5 to-transparent space-y-4">
          <h2 className="text-xl font-bold">Curious about your own GitHub DNA?</h2>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto">
            Analyze your repositories, unlock your developer archetype, and track your engineering velocity.
          </p>
          <Link href="/roast">
            <Button size="lg" className="gap-2 font-semibold">
              Get Your Free Assessment <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
