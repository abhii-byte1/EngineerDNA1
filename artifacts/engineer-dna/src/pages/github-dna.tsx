import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { 
  useAnalyzeGithub, 
  useListGithubReports, 
  useGetGithubReport, 
  getListGithubReportsQueryKey 
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { downloadReportAsPdf } from "@/lib/downloadReportAsPdf";
import { 
  Github, 
  GitBranch, 
  AlertTriangle, 
  Lightbulb, 
  CheckCircle2, 
  ArrowRight, 
  RefreshCw, 
  Lock, 
  Globe, 
  Code, 
  Sparkles,
  Download,
  Loader2
} from "lucide-react";
import { getArchetypeMeta } from "@/lib/archetypes";

const formSchema = z.object({
  username: z.string().min(1, "GitHub username is required"),
});

export default function GithubDNA() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: reports, isLoading: isListLoading } = useListGithubReports();
  
  const latestReport = reports && reports.length > 0 ? (reports[0] as any) : null;
  
  const isPolling = latestReport?.status === "pending" || latestReport?.status === "analyzing";
  const { data: polledReport } = useGetGithubReport(latestReport?.id as number, {
    // @ts-expect-error Zodios query configuration
    query: {
      enabled: isPolling && !!latestReport?.id,
      refetchInterval: 3000,
    },
  });

  const reportToDisplay = polledReport || latestReport;

  const analyze = useAnalyzeGithub();
  const [lastUsername, setLastUsername] = React.useState("");
  const [showOptInModal, setShowOptInModal] = React.useState(false);
  const [isUpdatingPublic, setIsUpdatingPublic] = React.useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = React.useState(false);
  const reportRef = React.useRef<HTMLDivElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { username: "" },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    setLastUsername(values.username);
    analyze.mutate(
      { data: { githubUsername: values.username } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListGithubReportsQueryKey() });
          form.reset();
          setShowOptInModal(true);
        },
      }
    );
  };

  const togglePublicStatus = async (newStatus: boolean) => {
    if (!reportToDisplay?.id) return;
    setIsUpdatingPublic(true);
    try {
      const res = await fetch(`/api/github-dna/reports/${reportToDisplay.id}/visibility`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublic: newStatus, leaderboardOptIn: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update visibility");
      
      queryClient.invalidateQueries({ queryKey: getListGithubReportsQueryKey() });
      toast({
        title: newStatus ? "Scorecard Published! 🌐" : "Scorecard Private 🔒",
        description: newStatus 
          ? "Your profile is now public at /u/" + reportToDisplay.githubUsername 
          : "Your profile is now hidden from public view.",
      });
      setShowOptInModal(false);
    } catch (err) {
      toast({
        title: "Update failed",
        description: err instanceof Error ? err.message : "Could not change status.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingPublic(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!reportToDisplay || isDownloadingPdf) return;
    setIsDownloadingPdf(true);
    try {
      const username = reportToDisplay.githubUsername || "user";
      const dateStr = new Date().toISOString().split("T")[0];
      await downloadReportAsPdf(reportRef.current, `EngineerDNA-GitHubDNA-${username}-${dateStr}.pdf`);
      toast({
        title: "PDF Downloaded! 📄",
        description: `Saved EngineerDNA-GitHubDNA-${username}-${dateStr}.pdf`,
      });
    } catch (err) {
      toast({
        title: "PDF Export Failed",
        description: err instanceof Error ? err.message : "Could not generate PDF.",
        variant: "destructive",
      });
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const copyBadgeMarkdown = () => {
    if (!reportToDisplay?.githubUsername) return;
    const badgeMarkdown = `[![EngineerDNA Score](https://${window.location.host}/api/badge/${reportToDisplay.githubUsername}.svg)](https://${window.location.host}/u/${reportToDisplay.githubUsername})`;
    navigator.clipboard.writeText(badgeMarkdown);
    toast({
      title: "README Badge Copied!",
      description: "Paste this markdown badge into your GitHub profile README.",
    });
  };

  if (isListLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-64 bg-muted rounded-xl"></div>
      </div>
    );
  }

  const isAnalyzing = analyze.isPending || isPolling;
  const meta = reportToDisplay ? getArchetypeMeta(reportToDisplay.archetype) : null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 text-primary rounded-xl">
            <Github className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">GitHub DNA</h1>
            <p className="text-muted-foreground">Architectural and behavioral code analysis growth engine.</p>
          </div>
        </div>

        {reportToDisplay && reportToDisplay.status === "completed" && (
          <div className="flex items-center gap-3">
            <Button
              variant={reportToDisplay.isPublic ? "outline" : "default"}
              size="sm"
              onClick={() => togglePublicStatus(!reportToDisplay.isPublic)}
              disabled={isUpdatingPublic}
              className="gap-2"
            >
              {reportToDisplay.isPublic ? (
                <>
                  <Lock className="w-4 h-4 text-muted-foreground" /> Make Private
                </>
              ) : (
                <>
                  <Globe className="w-4 h-4 text-primary" /> Make Public
                </>
              )}
            </Button>

            <Button variant="outline" size="sm" onClick={copyBadgeMarkdown} className="gap-2">
              <Code className="w-4 h-4" /> Copy Badge SVG
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadPdf}
              disabled={isDownloadingPdf}
              className="gap-2 border-primary/30 hover:bg-primary/10"
            >
              {isDownloadingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-primary" /> Generating PDF...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-primary" /> Download Report
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {!reportToDisplay && !isAnalyzing && (
        <Card className="max-w-xl mx-auto mt-12 border-primary/20">
          <CardHeader>
            <CardTitle>Initialize GitHub Scan</CardTitle>
            <CardDescription>
              We'll analyze your public repositories, commit patterns, and technology choices to determine your engineering profile.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="GitHub Username"
                  {...form.register("username")}
                  className="font-mono"
                />
                {form.formState.errors.username && (
                  <p className="text-sm text-destructive mt-1">{form.formState.errors.username.message}</p>
                )}
              </div>
              <Button type="submit" disabled={analyze.isPending}>
                {analyze.isPending ? "Starting..." : "Analyze"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {isAnalyzing && (
        <Card className="max-w-2xl mx-auto mt-12 border-primary/50 shadow-lg shadow-primary/10">
          <CardContent className="p-12 flex flex-col items-center justify-center text-center space-y-6">
            <div className="relative">
              <div className="w-24 h-24 border-4 border-muted rounded-full"></div>
              <div className="w-24 h-24 border-4 border-primary rounded-full border-t-transparent animate-spin absolute inset-0"></div>
              <Github className="w-8 h-8 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <div>
              <h3 className="text-xl font-bold tracking-tight mb-2">Analyzing your engineering DNA...</h3>
              <p className="text-muted-foreground font-mono text-sm max-w-sm">
                Cloning ASTs. Evaluating architectural complexity. Finding anti-patterns.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {reportToDisplay && reportToDisplay.status === "completed" && meta && (
        <motion.div
          ref={reportRef}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Hero Banner & Archetype */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="md:col-span-1 bg-primary/5 border-primary/20">
              <CardContent className="p-6 flex flex-col items-center justify-center h-full text-center">
                <div className="text-sm font-medium text-muted-foreground mb-2">Overall Score</div>
                <div className="text-5xl font-bold tracking-tighter text-primary mb-2">
                  {reportToDisplay.overallScore || 0}
                </div>
                <Badge variant="outline" className="font-mono bg-background">
                  {reportToDisplay.percentile !== null && reportToDisplay.percentile !== undefined
                    ? `Top ${100 - reportToDisplay.percentile}%`
                    : "Cohort < 20"}
                </Badge>
              </CardContent>
            </Card>

            <Card className="md:col-span-3">
              <CardContent className="p-6 h-full flex flex-col justify-between">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <div className="text-xs font-mono text-muted-foreground">DEVELOPER ARCHETYPE</div>
                    <h3 className="text-2xl font-bold font-mono">{meta.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{reportToDisplay.archetypeDescription || meta.tagline}</p>
                  </div>

                  <Badge variant="outline" className={`px-4 py-2 font-mono ${meta.badgeBg}`}>
                    <Sparkles className="w-4 h-4 mr-2" /> {meta.name}
                  </Badge>
                </div>

                <div className="mt-6 pt-4 border-t border-border flex flex-wrap gap-2">
                  {reportToDisplay.topLanguages?.map((lang: string) => (
                    <Badge key={lang} variant="secondary" className="font-mono">{lang}</Badge>
                  ))}
                  {reportToDisplay.techStack?.map((tech: string) => (
                    <Badge key={tech} variant="outline" className="font-mono bg-card">{tech}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Headline Strengths */}
          {reportToDisplay.headlineStrengths && reportToDisplay.headlineStrengths.length > 0 && (
            <Card className="border-border bg-card/60">
              <CardHeader>
                <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" /> Headline Strengths for Scorecard
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {reportToDisplay.headlineStrengths.map((h: string, i: number) => (
                  <div key={i} className="p-3 rounded-lg bg-muted/40 border border-border/60 text-sm font-medium">
                    ⚡ {h}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Insights Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-3 border-b border-border/50">
                <CardTitle className="flex items-center gap-2 text-green-500">
                  <CheckCircle2 className="w-5 h-5" /> Verified Strengths
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ul className="divide-y divide-border/50">
                  {reportToDisplay.strengths?.map((strength: string, i: number) => (
                    <li key={i} className="p-4 text-sm font-medium">{strength}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3 border-b border-border/50">
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="w-5 h-5" /> Detected Weaknesses
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ul className="divide-y divide-border/50">
                  {reportToDisplay.weaknesses?.map((weakness: string, i: number) => (
                    <li key={i} className="p-4 text-sm font-medium">{weakness}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Deep Insights */}
          <h2 className="text-2xl font-bold tracking-tight mt-12 mb-6 flex items-center gap-2">
            <Lightbulb className="text-accent" /> AI Insights
          </h2>

          <div className="space-y-4">
            {reportToDisplay.insights?.map((insight: any, i: number) => (
              <Card key={i} className="overflow-hidden border-l-4" style={{ borderLeftColor: getPriorityColor(insight.priority) }}>
                <div className="p-6 md:flex gap-6">
                  <div className="md:w-1/3 mb-4 md:mb-0">
                    <Badge className="mb-2" style={{ backgroundColor: getPriorityColor(insight.priority) }}>
                      {insight.priority.toUpperCase()} PRIORITY
                    </Badge>
                    <h4 className="font-bold text-lg leading-tight">{insight.observation}</h4>
                    <p className="text-xs font-mono text-muted-foreground mt-2 border-l-2 border-muted pl-2">
                      Evidence: {insight.evidence}
                    </p>
                  </div>
                  <div className="md:w-2/3 space-y-4">
                    <div>
                      <span className="text-xs uppercase text-muted-foreground font-bold tracking-wider">Impact</span>
                      <p className="text-sm mt-1">{insight.impact}</p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg border border-border">
                      <span className="text-xs uppercase text-primary font-bold tracking-wider flex items-center gap-1">
                        <ArrowRight className="w-3 h-3" /> Action Plan
                      </span>
                      <p className="text-sm mt-1 font-medium">{insight.actionPlan}</p>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </motion.div>
      )}

      {/* Opt-In Preview Modal */}
      {showOptInModal && reportToDisplay && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-lg w-full border-primary/30 shadow-2xl p-6 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-primary/10 text-primary">
                <Globe className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Public Scorecard Opt-In</h3>
                <p className="text-xs text-muted-foreground">Share your score, archetype, and developer rank.</p>
              </div>
            </div>

            {/* Live Preview Card */}
            <div className="p-4 rounded-xl bg-card border border-border space-y-3 font-mono text-sm">
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span>PREVIEW CARD</span>
                <span>@{reportToDisplay.githubUsername}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-3xl font-extrabold text-primary">{reportToDisplay.overallScore}</div>
                <div>
                  <div className="font-bold">{meta?.name}</div>
                  <div className="text-xs text-muted-foreground">Top GitHub Analysis</div>
                </div>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              By making your scorecard public, anyone with your handle can view your overall score, archetype, and headline strengths. Detailed raw code insights remain private to your account.
            </p>

            <div className="flex gap-3 justify-end">
              <Button variant="ghost" onClick={() => setShowOptInModal(false)}>
                Keep Private
              </Button>
              <Button onClick={() => togglePublicStatus(true)} disabled={isUpdatingPublic} className="gap-2">
                <Globe className="w-4 h-4" /> Make It Public
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

function getPriorityColor(priority: string) {
  switch (priority) {
    case 'critical': return 'hsl(0, 84%, 60%)';
    case 'high': return 'hsl(30, 80%, 55%)';
    case 'medium': return 'hsl(217, 91%, 60%)';
    default: return 'hsl(220, 10%, 40%)';
  }
}
