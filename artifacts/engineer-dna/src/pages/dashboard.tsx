import * as React from "react"
import { motion } from "framer-motion"
import { Link } from "wouter"
import { useGetDashboardSummary } from "@workspace/api-client-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Activity, Target, Zap, AlertCircle, CheckCircle2, ArrowRight, Github, Globe, FileText, TrendingUp, TrendingDown, Minus } from "lucide-react"

export default function Dashboard() {
  const { data: summary, isLoading, isError } = useGetDashboardSummary()

  if (isLoading) {
    return <DashboardSkeleton />
  }

  if (isError || !summary) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertCircle className="w-12 h-12 text-destructive mb-4" />
        <h2 className="text-2xl font-bold mb-2">Failed to load dashboard</h2>
        <p className="text-muted-foreground">The system encountered an error fetching your data.</p>
      </div>
    )
  }

  const {
    engineeringScore,
    githubAnalyzed,
    portfolioAnalyzed,
    resumeAnalyzed,
    activeGoals,
    completedGoals,
    journalStreak,
    recentInsights,
    topSkillGaps,
    nextAction,
    currentStandingBand
  } = summary

  const getBandIcon = () => {
    switch (currentStandingBand) {
      case "excellent": return <TrendingUp className="text-primary w-5 h-5" />
      case "good": return <TrendingUp className="text-secondary w-5 h-5" />
      case "needs_work": return <Minus className="text-muted-foreground w-5 h-5" />
      case "critical": return <TrendingDown className="text-destructive w-5 h-5" />
      case "new": return <Activity className="text-accent w-5 h-5" />
      default: return <Activity className="w-5 h-5" />
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Overview</h1>
          <p className="text-muted-foreground font-mono mt-1 text-sm">
            Status: {currentStandingBand?.replace('_', ' ').toUpperCase()} | Identity: {summary.user.name}
          </p>
        </div>
        
        {engineeringScore !== undefined && engineeringScore !== null && (
          <div className="flex items-center gap-4 bg-card border border-border rounded-lg p-4">
            <div className="text-right">
              <div className="text-sm font-medium text-muted-foreground">Overall Score</div>
              <div className="text-3xl font-bold tracking-tighter text-primary">{engineeringScore}</div>
            </div>
            <div className="w-12 h-12 rounded-full border-4 border-primary/20 flex items-center justify-center relative">
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle
                  cx="24" cy="24" r="22" fill="none"
                  stroke="currentColor" strokeWidth="4"
                  className="text-primary"
                  strokeDasharray={`${engineeringScore * 1.38} 138`}
                />
              </svg>
              <Zap className="w-5 h-5 text-primary" />
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricCard title="Active Goals" value={activeGoals.toString()} sub={`${completedGoals} completed`} icon={<Target />} />
        <MetricCard title="Current Standing" value={currentStandingBand?.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) || "New"} icon={getBandIcon()} />
        <MetricCard title="GitHub Status" value={githubAnalyzed ? "Analyzed" : "Pending"} sub="Primary Growth Engine" icon={<Github />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Core Modules</CardTitle>
              <CardDescription>Analysis status across your growth engine</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ModuleStatusCard 
                title="GitHub DNA" 
                icon={<Github className="w-5 h-5" />} 
                isAnalyzed={githubAnalyzed} 
                href="/github-dna" 
              />
              <ModuleStatusCard 
                title="Resume DNA" 
                icon={<FileText className="w-5 h-5" />} 
                isAnalyzed={resumeAnalyzed} 
                href="/resume-dna" 
              />
            </CardContent>
          </Card>

          {recentInsights.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Insights</CardTitle>
                <CardDescription>Critical findings from latest scans</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentInsights.map((insight, i) => (
                  <div key={i} className="p-4 rounded-lg bg-muted border border-border text-sm">
                    <p className="font-medium">{insight}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" /> Recommended Action
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium mb-4">{nextAction || "Run a complete analysis to get recommendations."}</p>
              <Link href={!githubAnalyzed ? "/github-dna" : "/goals"}>
                <Button className="w-full">
                  Execute <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {topSkillGaps.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Top Skill Gaps</CardTitle>
                <CardDescription>Areas needing immediate focus</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {topSkillGaps.map(gap => (
                    <Badge key={gap} variant="destructive" className="bg-destructive/20 text-destructive border-destructive/30 hover:bg-destructive/30">
                      {gap}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

function MetricCard({ title, value, sub, icon }: { title: string, value: string, sub?: string, icon: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-y-0 pb-2">
          <p className="text-sm font-medium tracking-tight text-muted-foreground">{title}</p>
          <div className="text-muted-foreground">{icon}</div>
        </div>
        <div className="text-2xl font-bold">{value}</div>
        {sub && <p className="text-xs text-muted-foreground font-mono mt-1">{sub}</p>}
      </CardContent>
    </Card>
  )
}

function ModuleStatusCard({ title, icon, isAnalyzed, href }: { title: string, icon: React.ReactNode, isAnalyzed: boolean, href: string }) {
  return (
    <Link href={href}>
      <div className={`p-4 rounded-lg border flex flex-col h-full transition-colors hover:border-primary cursor-pointer ${isAnalyzed ? 'bg-card border-border' : 'bg-muted/50 border-dashed border-border/60'}`}>
        <div className="flex items-center justify-between mb-4">
          <div className={`p-2 rounded-md ${isAnalyzed ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
            {icon}
          </div>
          {isAnalyzed ? (
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          ) : (
            <AlertCircle className="w-5 h-5 text-muted-foreground" />
          )}
        </div>
        <h3 className="font-bold mb-1">{title}</h3>
        <p className="text-xs text-muted-foreground mt-auto">
          {isAnalyzed ? "Analyzed. Click to view." : "Pending scan. Start now."}
        </p>
      </div>
    </Link>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="h-12 w-64 bg-muted rounded"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <div key={i} className="h-32 bg-muted rounded-xl"></div>)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-64 bg-muted rounded-xl"></div>
        <div className="h-64 bg-muted rounded-xl"></div>
      </div>
    </div>
  )
}
