import * as React from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { motion } from "framer-motion"
import { useAnalyzeResume, useListResumeReports, getListResumeReportsQueryKey } from "@workspace/api-client-react"
import { useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { FileText, Target, Search, AlertCircle, Wand2, Check, RefreshCw } from "lucide-react"

const formSchema = z.object({
  targetRole: z.string().optional(),
  resumeText: z.string().min(50, "Paste at least 50 characters of your resume")
})

export default function ResumeDNA() {
  const queryClient = useQueryClient()
  const { data: reports, isLoading: isListLoading } = useListResumeReports()
  
  const latestReport = reports && reports.length > 0 ? reports[0] : null
  const analyze = useAnalyzeResume()
  const [lastValues, setLastValues] = React.useState<{ resumeText: string; targetRole?: string } | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { targetRole: "", resumeText: "" }
  })

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    setLastValues({ resumeText: values.resumeText, targetRole: values.targetRole || undefined })
    analyze.mutate({ 
      data: { 
        resumeText: values.resumeText,
        targetRole: values.targetRole || undefined
      } 
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListResumeReportsQueryKey() })
        form.reset()
      }
    })
  }

  const retryAnalysis = () => {
    if (!lastValues) return
    analyze.mutate({ data: lastValues }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getListResumeReportsQueryKey() })
    })
  }

  if (isListLoading) return <div className="animate-pulse space-y-4"><div className="h-64 bg-muted rounded-xl"></div></div>

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-accent/10 text-accent rounded-xl">
          <FileText className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Resume DNA</h1>
          <p className="text-muted-foreground">Impact-driven text analysis and skill gap detection.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input Form */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Parse Resume</CardTitle>
              <CardDescription>Paste your raw resume text to analyze its effectiveness.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Target Role (Optional)</label>
                  <Input 
                    placeholder="e.g. Senior Frontend Engineer" 
                    {...form.register("targetRole")}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Resume Content</label>
                  <Textarea 
                    placeholder="Paste the raw text of your resume here..." 
                    className="min-h-[250px] font-mono text-xs"
                    {...form.register("resumeText")}
                  />
                  {form.formState.errors.resumeText && (
                    <p className="text-sm text-destructive mt-1">{form.formState.errors.resumeText.message}</p>
                  )}
                </div>
                <Button type="submit" disabled={analyze.isPending} className="w-full" variant="outline">
                  {analyze.isPending ? "Analyzing impact..." : "Analyze Resume"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Results */}
        <div className="lg:col-span-2">
          {analyze.isPending ? (
            <Card className="h-full min-h-[400px] flex items-center justify-center border-dashed">
              <div className="text-center space-y-4">
                <Search className="w-12 h-12 text-muted-foreground animate-pulse mx-auto" />
                <p className="font-mono text-sm text-muted-foreground">Searching for quantifiable metrics...</p>
              </div>
            </Card>
          ) : latestReport?.status === "failed" ? (
            <Card className="h-full min-h-[400px] flex items-center justify-center border-destructive/50 bg-destructive/5">
              <div className="text-center space-y-4">
                <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
                <div>
                  <p className="font-semibold text-destructive">Analysis failed</p>
                  <p className="text-sm text-muted-foreground mt-1">Something went wrong processing your resume.</p>
                </div>
                <Button variant="outline" onClick={retryAnalysis} disabled={analyze.isPending} className="gap-2">
                  <RefreshCw className="w-4 h-4" /> Retry Analysis
                </Button>
              </div>
            </Card>
          ) : latestReport ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              
              <div className="grid grid-cols-3 gap-4">
                <ScoreCard title="Writing Quality" score={latestReport.writingQualityScore || 0} />
                <ScoreCard title="Tech Accuracy" score={latestReport.technicalAccuracyScore || 0} />
                <ScoreCard title="Impact" score={latestReport.impactScore || 0} />
              </div>

              {latestReport.missingSkills && latestReport.missingSkills.length > 0 && (
                <Card className="border-destructive/30 bg-destructive/5">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-destructive text-sm flex items-center gap-2">
                      <Target className="w-4 h-4" /> Missing Keywords For Target Role
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {latestReport.missingSkills.map((skill, i) => (
                        <Badge key={i} variant="destructive" className="bg-destructive/10 text-destructive border-none">{skill}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {latestReport.weakClaims && latestReport.improvedBullets && latestReport.weakClaims.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Wand2 className="w-5 h-5 text-accent" /> Bullet Point Rewrites
                    </CardTitle>
                    <CardDescription>Converting passive tasks into active achievements.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Assuming arrays match length for display purposes, or mapping through paired strings */}
                    {latestReport.weakClaims.map((weak, i) => (
                      <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-3 bg-destructive/5 border border-destructive/20 rounded-md">
                          <div className="flex items-center gap-1 text-destructive text-xs font-bold uppercase mb-2">
                            <AlertCircle className="w-3 h-3" /> Before
                          </div>
                          <p className="text-sm line-through opacity-70">{weak}</p>
                        </div>
                        <div className="p-3 bg-green-500/5 border border-green-500/20 rounded-md">
                          <div className="flex items-center gap-1 text-green-500 text-xs font-bold uppercase mb-2">
                            <Check className="w-3 h-3" /> After
                          </div>
                          <p className="text-sm font-medium">{latestReport.improvedBullets?.[i] || "Add quantifiable metric (e.g. reduced load time by 40%)"}</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

            </motion.div>
          ) : (
            <Card className="h-full min-h-[400px] flex items-center justify-center border-dashed bg-muted/20">
              <div className="text-center space-y-2 text-muted-foreground">
                <FileText className="w-12 h-12 opacity-20 mx-auto" />
                <p>No analysis performed yet.</p>
                <p className="text-xs">Paste your resume to begin.</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

function ScoreCard({ title, score }: { title: string, score: number }) {
  return (
    <Card className="bg-card/50">
      <CardContent className="p-4 text-center">
        <div className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-2">{title}</div>
        <div className="text-3xl font-bold text-foreground">{score}<span className="text-sm text-muted-foreground">/100</span></div>
      </CardContent>
    </Card>
  )
}
