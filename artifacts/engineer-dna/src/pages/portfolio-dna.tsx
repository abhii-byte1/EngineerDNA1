import * as React from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { motion } from "framer-motion"
import { useAnalyzePortfolio, useListPortfolioReports, getListPortfolioReportsQueryKey } from "@workspace/api-client-react"
import { useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Globe, Layout, Zap, Eye, Search, AlertTriangle, CheckCircle2, RefreshCw } from "lucide-react"

const formSchema = z.object({
  url: z.string().url("Must be a valid URL")
})

export default function PortfolioDNA() {
  const queryClient = useQueryClient()
  const { data: reports, isLoading: isListLoading } = useListPortfolioReports()
  
  const latestReport = reports && reports.length > 0 ? reports[0] : null
  
  const analyze = useAnalyzePortfolio()
  const [lastUrl, setLastUrl] = React.useState("")

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { url: "" }
  })

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    setLastUrl(values.url)
    analyze.mutate({ data: { portfolioUrl: values.url } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListPortfolioReportsQueryKey() })
        form.reset()
      }
    })
  }

  const retryAnalysis = () => {
    const url = lastUrl || latestReport?.portfolioUrl || ""
    if (!url) return
    analyze.mutate({ data: { portfolioUrl: url } }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getListPortfolioReportsQueryKey() })
    })
  }

  if (isListLoading) {
    return <div className="animate-pulse space-y-4"><div className="h-64 bg-muted rounded-xl"></div></div>
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-secondary/10 text-secondary rounded-xl">
          <Globe className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Portfolio DNA</h1>
          <p className="text-muted-foreground">Performance, accessibility, and UI/UX analysis.</p>
        </div>
      </div>

      <Card className="border-border">
        <CardHeader>
          <CardTitle>Scan Portfolio Target</CardTitle>
          <CardDescription>
            Enter your personal website URL. We'll run a deep lighthouse-style analysis combined with UI heuristic checks.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-4 max-w-2xl">
            <div className="flex-1">
              <Input 
                placeholder="https://yourdomain.com" 
                {...form.register("url")}
                className="font-mono"
              />
              {form.formState.errors.url && (
                <p className="text-sm text-destructive mt-1">{form.formState.errors.url.message}</p>
              )}
            </div>
            <Button type="submit" disabled={analyze.isPending} variant="secondary">
              {analyze.isPending ? "Scanning..." : "Execute Scan"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {analyze.isPending && (
        <Card className="border-secondary/50 shadow-lg shadow-secondary/10">
          <CardContent className="p-12 flex flex-col items-center justify-center text-center space-y-6">
            <div className="relative">
              <div className="w-24 h-24 border-4 border-muted rounded-full"></div>
              <div className="w-24 h-24 border-4 border-secondary rounded-full border-t-transparent animate-spin absolute inset-0"></div>
              <Globe className="w-8 h-8 text-secondary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <div>
              <h3 className="text-xl font-bold tracking-tight mb-2">Running diagnostics...</h3>
              <p className="text-muted-foreground font-mono text-sm max-w-sm">
                Parsing DOM. Checking contrast ratios. Simulating network conditions.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {latestReport && latestReport.status === "failed" && !analyze.isPending && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="p-8 flex flex-col items-center gap-4 text-center">
            <AlertTriangle className="w-10 h-10 text-destructive" />
            <div>
              <p className="font-semibold text-destructive">Analysis failed</p>
              <p className="text-sm text-muted-foreground mt-1">
                Could not scan <span className="font-mono">{latestReport.portfolioUrl}</span>. The URL may be unreachable or blocked.
              </p>
            </div>
            <Button variant="outline" onClick={retryAnalysis} disabled={analyze.isPending} className="gap-2">
              <RefreshCw className="w-4 h-4" /> Retry Scan
            </Button>
          </CardContent>
        </Card>
      )}

      {latestReport && latestReport.status !== "failed" && !analyze.isPending && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="outline" className="font-mono bg-muted/50">Target: {latestReport.portfolioUrl}</Badge>
            <Badge variant="outline" className="font-mono bg-muted/50">Status: {latestReport.status.toUpperCase()}</Badge>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <ScoreGauge title="Performance" score={latestReport.performanceScore || 0} icon={<Zap className="w-4 h-4" />} color="text-yellow-500" />
            <ScoreGauge title="Accessibility" score={latestReport.accessibilityScore || 0} icon={<Eye className="w-4 h-4" />} color="text-blue-500" />
            <ScoreGauge title="SEO" score={latestReport.seoScore || 0} icon={<Search className="w-4 h-4" />} color="text-green-500" />
            <ScoreGauge title="UI/UX" score={latestReport.uiScore || 0} icon={<Layout className="w-4 h-4" />} color="text-purple-500" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <Card>
              <CardHeader className="pb-3 border-b border-border/50">
                <CardTitle className="text-green-500 flex items-center gap-2 text-lg">
                  <CheckCircle2 className="w-5 h-5" /> Passed Heuristics
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ul className="divide-y divide-border/50">
                  {latestReport.strengths?.map((item, i) => (
                    <li key={i} className="p-4 text-sm">{item}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3 border-b border-border/50">
                <CardTitle className="text-destructive flex items-center gap-2 text-lg">
                  <AlertTriangle className="w-5 h-5" /> Failed Heuristics
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ul className="divide-y divide-border/50">
                  {latestReport.weaknesses?.map((item, i) => (
                    <li key={i} className="p-4 text-sm">{item}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {latestReport.recommendations && latestReport.recommendations.length > 0 && (
            <Card className="bg-secondary/5 border-secondary/20">
              <CardHeader>
                <CardTitle className="text-secondary">Improvement Protocol</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-decimal pl-5 space-y-2 text-sm font-medium">
                  {latestReport.recommendations.map((rec, i) => (
                    <li key={i}>{rec}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </motion.div>
      )}
    </div>
  )
}

function ScoreGauge({ title, score, icon, color }: { title: string, score: number, icon: React.ReactNode, color: string }) {
  // Determine color based on score if not specifically colored by prop (simple version)
  const getScoreColor = (s: number) => {
    if (s >= 90) return "text-green-500";
    if (s >= 50) return "text-yellow-500";
    return "text-destructive";
  }
  
  const finalColor = getScoreColor(score);

  return (
    <Card>
      <CardContent className="p-6 flex flex-col items-center justify-center text-center">
        <div className="flex items-center gap-2 text-muted-foreground mb-4 text-sm font-medium">
          {icon} {title}
        </div>
        <div className="relative w-24 h-24 flex items-center justify-center">
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle
              cx="48" cy="48" r="44" fill="none"
              stroke="currentColor" strokeWidth="6"
              className="text-muted"
            />
            <circle
              cx="48" cy="48" r="44" fill="none"
              stroke="currentColor" strokeWidth="6"
              className={finalColor}
              strokeDasharray={`${score * 2.76} 276`}
              strokeLinecap="round"
            />
          </svg>
          <span className={`text-2xl font-bold ${finalColor}`}>{score}</span>
        </div>
      </CardContent>
    </Card>
  )
}
