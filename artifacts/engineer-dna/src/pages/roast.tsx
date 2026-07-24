import * as React from "react";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Flame, 
  Sparkles, 
  Github, 
  Share2, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  Trophy,
  Zap,
  Info
} from "lucide-react";
import { getArchetypeMeta } from "@/lib/archetypes";
import { FeedbackWidget } from "@/components/feedback-widget";

interface RoastResponse {
  overallScore: number;
  archetype: string;
  archetypeDescription: string;
  headlineStrengths: string[];
  strengths: string[];
  weaknesses: string[];
  techStack: string[];
  topLanguages: string[];
  roastBullets?: string[];
  percentile: number | null;
  cohortSize: number;
}

export default function RoastPage() {
  const [username, setUsername] = React.useState("");
  const [mode, setMode] = React.useState<"roast" | "coach">("roast");
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<RoastResponse | null>(null);
  const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY || "";
  const [turnstileToken, setTurnstileToken] = React.useState<string>(() => {
    if (!turnstileSiteKey) return "bypass-turnstile-token";
    return import.meta.env.DEV ? "dev-turnstile-token" : "";
  });
  const turnstileRef = React.useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  React.useEffect(() => {
    if (!turnstileSiteKey || !turnstileRef.current) return;

    // Load Cloudflare Turnstile script if not already present
    const scriptId = "cf-turnstile-script";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
      script.onload = () => {
        if ((window as any).turnstile && turnstileRef.current) {
          (window as any).turnstile.render(turnstileRef.current, {
            sitekey: turnstileSiteKey,
            callback: (token: string) => setTurnstileToken(token),
          });
        }
      };
    } else if ((window as any).turnstile && turnstileRef.current) {
      (window as any).turnstile.render(turnstileRef.current, {
        sitekey: turnstileSiteKey,
        callback: (token: string) => setTurnstileToken(token),
      });
    }
  }, [turnstileSiteKey]);

  const handleRoast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      toast({ title: "Please enter a GitHub username", variant: "destructive" });
      return;
    }

    if (!turnstileToken) {
      toast({ title: "Please complete the verification check", variant: "destructive" });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/roast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          githubUsername: username.trim(),
          mode,
          turnstileToken,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to analyze GitHub profile");
      }

      setResult(json);
    } catch (err) {
      toast({
        title: "Roast Failed",
        description: err instanceof Error ? err.message : "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({ title: "Link copied!", description: "Share this page with friends." });
  };

  return (
    <div className="min-h-screen bg-background text-foreground py-12 px-4 md:px-8 max-w-4xl mx-auto space-y-10">
      {/* Header */}
      <div className="text-center space-y-4">
        <Badge variant="outline" className="px-4 py-1 border-primary/30 text-primary font-mono text-xs">
          UNAUTHENTICATED ENTRY POINT
        </Badge>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight font-mono flex items-center justify-center gap-3">
          Roast My GitHub <Flame className="w-8 h-8 text-orange-500 fill-orange-500 animate-pulse" />
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto text-sm md:text-base">
          Get an instant, brutal, AI-powered evaluation of your GitHub code quality, commit habits, and developer archetype.
        </p>

        {/* Nudge Banner */}
        <div className="inline-flex items-center gap-2 p-3 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs md:text-sm font-medium">
          <Info className="w-4 h-4 shrink-0" />
          <span>Roasting yourself hits different — paste your own username for the full experience 👀</span>
        </div>
      </div>

      {/* Form Card */}
      <Card className="border-border bg-card/60 backdrop-blur-xl">
        <CardContent className="p-6 md:p-8">
          <form onSubmit={handleRoast} className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-1 w-full">
                <Github className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter GitHub username (e.g. torvalds)"
                  className="pl-10 h-12 text-base font-mono bg-background"
                />
              </div>

              {/* Mode Toggle */}
              <div className="flex items-center bg-muted p-1 rounded-lg shrink-0">
                <button
                  type="button"
                  onClick={() => setMode("roast")}
                  className={`px-4 py-2 text-xs font-bold rounded-md transition-all ${
                    mode === "roast"
                      ? "bg-gradient-to-r from-orange-500 to-red-600 text-white shadow"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  🔥 Roast Mode
                </button>
                <button
                  type="button"
                  onClick={() => setMode("coach")}
                  className={`px-4 py-2 text-xs font-bold rounded-md transition-all ${
                    mode === "coach"
                      ? "bg-primary text-primary-foreground shadow"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  ⚡ Coach Mode
                </button>
              </div>

              <Button type="submit" disabled={loading} size="lg" className="h-12 px-8 font-bold shrink-0">
                {loading ? "Analyzing..." : mode === "roast" ? "Roast 🔥" : "Evaluate ⚡"}
              </Button>
            </div>
            {turnstileSiteKey && (
              <div className="flex justify-center pt-2">
                <div ref={turnstileRef} />
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Results View */}
      {result && (
        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
          <div className="rounded-2xl border border-border bg-card/40 backdrop-blur-xl p-8 space-y-6 shadow-2xl relative overflow-hidden">
            {/* Header info */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">RESULT FOR</span>
                <h2 className="text-3xl font-bold font-mono">@{username}</h2>
                <p className="text-sm text-muted-foreground mt-1">{result.archetypeDescription}</p>
              </div>

              <div className="flex items-center gap-4 bg-background/80 border border-border rounded-xl p-4">
                <div className="text-right">
                  <div className="text-xs font-semibold text-muted-foreground">SCORE</div>
                  <div className="text-3xl font-bold font-mono text-primary">{result.overallScore}</div>
                </div>
                {result.percentile !== null && (
                  <div className="text-right border-l border-border pl-4">
                    <div className="text-xs font-semibold text-muted-foreground">PERCENTILE</div>
                    <div className="text-sm font-bold text-amber-400">Top {100 - result.percentile}%</div>
                  </div>
                )}
              </div>
            </div>

            {/* Archetype pill */}
            {(() => {
              const meta = getArchetypeMeta(result.archetype);
              return (
                <div className={`p-4 rounded-xl border flex items-center gap-3 ${meta.badgeBg}`}>
                  <Sparkles className="w-5 h-5 shrink-0" />
                  <div>
                    <div className="text-xs font-semibold uppercase opacity-80">Developer Archetype</div>
                    <div className="text-base font-bold">{meta.name}</div>
                  </div>
                </div>
              );
            })()}

            {/* Roast Bullets */}
            {result.roastBullets && result.roastBullets.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-border">
                <h3 className="text-sm font-bold uppercase tracking-wider text-orange-400 flex items-center gap-2">
                  <Flame className="w-4 h-4" /> Brutal Observations
                </h3>
                <div className="space-y-2">
                  {result.roastBullets.map((bullet, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-orange-500/5 border border-orange-500/20 text-sm font-medium">
                      🔥 {bullet}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tech Stack */}
            <div className="pt-4 border-t border-border space-y-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Top Languages & Tech</span>
              <div className="flex flex-wrap gap-2">
                {result.topLanguages.map((lang) => (
                  <Badge key={lang} variant="secondary" className="font-mono text-xs">
                    {lang}
                  </Badge>
                ))}
                {result.techStack.map((tech) => (
                  <Badge key={tech} variant="outline" className="font-mono text-xs border-primary/20 text-primary">
                    {tech}
                  </Badge>
                ))}
              </div>
            </div>

            {/* CTA Banner to save */}
            <div className="p-6 rounded-xl bg-primary/10 border border-primary/20 text-center space-y-3">
              <h3 className="text-lg font-bold">Want to save your analysis & track growth over time?</h3>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                Sign in to build your official public scorecard, unlock interactive roadmaps, and compare ranks.
              </p>
              <Link href="/login">
                <Button className="gap-2 font-bold">
                  Sign In to Save Progress <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>

            {/* Feedback Widget */}
            <div className="pt-4 border-t border-border">
              <FeedbackWidget context="roast_result" contextId={username} title="Was this roast evaluation accurate?" />
            </div>
          </div>
        </div>
      )}

      {/* Footer / ToS Clause */}
      <footer className="text-center text-xs text-muted-foreground border-t border-border pt-8">
        <p>
          Results reflect public GitHub activity only. Analysis results are processed in real-time, not stored on server disk for unauthenticated roasts, and may not be used to harass others.
        </p>
      </footer>
    </div>
  );
}
