import * as React from "react";
import { useListGithubReports } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Map, ArrowRight, CheckCircle2, Zap, Target, GitBranch } from "lucide-react";
import { Link } from "wouter";

export default function RoadmapPage() {
  const { data: reports, isLoading } = useListGithubReports();
  const latestReport = reports && reports.length > 0 ? (reports[0] as any) : null;

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-4xl mx-auto animate-pulse">
        <div className="h-12 w-64 bg-muted rounded" />
        <div className="h-48 bg-muted rounded-xl" />
        <div className="h-48 bg-muted rounded-xl" />
        <div className="h-48 bg-muted rounded-xl" />
      </div>
    );
  }

  if (!latestReport || latestReport.status !== "completed") {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center">
          <Map className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Micro-Roadmap Locked</h1>
        <p className="text-muted-foreground text-sm">
          Run your GitHub DNA analysis to generate exactly 3 concrete, high-impact action items grounded in your actual repositories.
        </p>
        <Link href="/github-dna">
          <Button size="lg" className="gap-2">
            Analyze GitHub DNA <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    );
  }

  // Derive Next 3 Things from recommendations or insights
  const nextActions = (latestReport.recommendations as string[])?.slice(0, 3) || [
    "Refactor repository structure to separate core domain logic from framework handlers.",
    "Add automated CI/CD unit testing pipelines with continuous integration checks.",
    "Draft comprehensive API documentation and README architecture specs.",
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <Badge variant="outline" className="px-3 py-1 border-primary/30 text-primary font-mono text-xs mb-2">
          ACTIONABLE MICRO-ROADMAP
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight">Next 3 Things</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Grounded directly in @{latestReport.githubUsername}'s recent GitHub repository analysis.
        </p>
      </div>

      {/* 3 Action Cards */}
      <div className="space-y-6">
        {nextActions.map((action, idx) => (
          <Card key={idx} className="border-border bg-card/60 relative overflow-hidden">
            <div className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-mono font-extrabold shrink-0 mt-1 md:mt-0">
                  #{idx + 1}
                </div>
                <div>
                  <h3 className="text-lg font-bold tracking-tight">{action}</h3>
                  <p className="text-xs text-muted-foreground mt-1 font-mono">
                    Priority Focus • Grounded in latest repo scan
                  </p>
                </div>
              </div>

              <Link href="/goals">
                <Button variant="outline" size="sm" className="gap-2 shrink-0 border-primary/20 hover:bg-primary/10">
                  <Target className="w-4 h-4 text-primary" /> Track as Goal
                </Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>

      {/* Summary Footer */}
      <Card className="border-primary/20 bg-primary/5 p-6 text-center space-y-4">
        <Zap className="w-8 h-8 text-primary mx-auto" />
        <h3 className="text-lg font-bold">Ready to measure progress?</h3>
        <p className="text-xs text-muted-foreground max-w-md mx-auto">
          Re-analyze your GitHub profile after executing these items to update your overall score and developer rank.
        </p>
        <Link href="/github-dna">
          <Button variant="default" className="gap-2">
            Re-Analyze GitHub DNA <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </Card>
    </div>
  );
}
