import * as React from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { motion } from "framer-motion"
import { useAnalyzeGithub, useListGithubReports, useGetGithubReport, getListGithubReportsQueryKey } from "@workspace/api-client-react"
import { useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Github, Loader2, GitBranch, AlertTriangle, Lightbulb, CheckCircle2, ArrowRight, RefreshCw } from "lucide-react"

const formSchema = z.object({
  username: z.string().min(1, "GitHub username is required")
})

export default function GithubDNA() {
  const queryClient = useQueryClient()
  const { data: reports, isLoading: isListLoading } = useListGithubReports()
  
  const latestReport = reports && reports.length > 0 ? reports[0] : null
  
  // Also setup polling if status is pending/analyzing
  const isPolling = latestReport?.status === "pending" || latestReport?.status === "analyzing"
  const { data: polledReport } = useGetGithubReport(latestReport?.id as number, {
    query: {
      enabled: isPolling && !!latestReport?.id,
      refetchInterval: 3000,
    }
  })

  const reportToDisplay = polledReport || latestReport

  const analyze = useAnalyzeGithub()
  const [lastUsername, setLastUsername] = React.useState("")
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { username: "" }
  })

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    setLastUsername(values.username)
    analyze.mutate({ data: { githubUsername: values.username } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListGithubReportsQueryKey() })
        form.reset()
      }
    })
  }

  const retryAnalysis = () => {
    const username = lastUsername || reportToDisplay?.githubUsername || ""
    if (!username) return
    analyze.mutate({ data: { githubUsername: username } }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getListGithubReportsQueryKey() })
    })
  }

  if (isListLoading) {
    return <div className="animate-pulse space-y-4"><div className="h-64 bg-muted rounded-xl"></div></div>
  }

  const isAnalyzing = analyze.isPending || isPolling

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-primary/10 text-primary rounded-xl">
          <Github className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">GitHub DNA</h1>
          <p className="text-muted-foreground">Architectural and behavioral code analysis.</p>
        </div>
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
                Cloning ASTs. Evaluating architectural complexity. Finding anti-patterns. This takes 30-60 seconds.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {reportToDisplay && reportToDisplay.status === "completed" && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Top Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="md:col-span-1 bg-primary/5 border-primary/20">
              <CardContent className="p-6 flex flex-col items-center justify-center h-full text-center">
                <div className="text-sm font-medium text-muted-foreground mb-2">Code Quality Score</div>
                <div className="text-5xl font-bold tracking-tighter text-primary mb-2">
                  {reportToDisplay.overallScore || 0}
                </div>
                <Badge variant="outline" className="font-mono bg-background">Top 15%</Badge>
              </CardContent>
            </Card>
            
            <Card className="md:col-span-3">
              <CardContent className="p-6 h-full flex flex-col justify-center">
                <div className="grid grid-cols-3 gap-8">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Target Account</div>
                    <div className="font-mono font-bold text-lg">@{reportToDisplay.githubUsername}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Total Repositories</div>
                    <div className="font-mono font-bold text-lg">{reportToDisplay.totalRepositories || "N/A"}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Total Commits</div>
                    <div className="font-mono font-bold text-lg">{reportToDisplay.totalCommits || "N/A"}</div>
                  </div>
                </div>
                
                <div className="mt-8">
                  <div className="text-sm text-muted-foreground mb-3">Dominant Stack</div>
                  <div className="flex flex-wrap gap-2">
                    {reportToDisplay.topLanguages?.map(lang => (
                      <Badge key={lang} variant="secondary" className="font-mono">{lang}</Badge>
                    ))}
                    {reportToDisplay.techStack?.map(tech => (
                      <Badge key={tech} variant="outline" className="font-mono bg-card">{tech}</Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

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
                  {reportToDisplay.strengths?.map((strength, i) => (
                    <li key={i} className="p-4 text-sm font-medium">{strength}</li>
                  ))}
                  {!reportToDisplay.strengths?.length && <li className="p-4 text-muted-foreground">No data available</li>}
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
                  {reportToDisplay.weaknesses?.map((weakness, i) => (
                    <li key={i} className="p-4 text-sm font-medium">{weakness}</li>
                  ))}
                  {!reportToDisplay.weaknesses?.length && <li className="p-4 text-muted-foreground">No data available</li>}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Deep Insights */}
          <h2 className="text-2xl font-bold tracking-tight mt-12 mb-6 flex items-center gap-2">
            <Lightbulb className="text-accent" /> AI Insights
          </h2>
          
          <div className="space-y-4">
            {reportToDisplay.insights?.map((insight, i) => (
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
                      <p className="text-xs font-mono text-accent mt-2">
                        Est. Improvement: {insight.estimatedImprovement}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          
          {/* Architecture Issues */}
          {reportToDisplay.architectureIssues && reportToDisplay.architectureIssues.length > 0 && (
            <Card className="border-destructive/30 bg-destructive/5 mt-8">
              <CardHeader>
                <CardTitle className="text-destructive flex items-center gap-2">
                  <GitBranch className="w-5 h-5" /> Architecture Anti-patterns
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-2 text-sm">
                  {reportToDisplay.architectureIssues.map((issue, i) => (
                    <li key={i}>{issue}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </motion.div>
      )}

      {reportToDisplay && reportToDisplay.status === "failed" && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="p-8 flex flex-col items-center gap-4 text-center">
            <AlertTriangle className="w-10 h-10 text-destructive" />
            <div>
              <p className="font-semibold text-destructive">Analysis failed</p>
              <p className="text-sm text-muted-foreground mt-1">
                Could not complete analysis for <span className="font-mono">{reportToDisplay.githubUsername}</span>. Check the username and try again.
              </p>
            </div>
            <Button variant="outline" onClick={retryAnalysis} disabled={analyze.isPending} className="gap-2">
              <RefreshCw className="w-4 h-4" /> Retry Analysis
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function getPriorityColor(priority: string) {
  switch (priority) {
    case 'critical': return 'hsl(0, 84%, 60%)' // destructive
    case 'high': return 'hsl(30, 80%, 55%)' // chart-4 (orange)
    case 'medium': return 'hsl(217, 91%, 60%)' // primary
    case 'low': return 'hsl(220, 10%, 40%)' // muted
    default: return 'hsl(220, 10%, 40%)'
  }
}
