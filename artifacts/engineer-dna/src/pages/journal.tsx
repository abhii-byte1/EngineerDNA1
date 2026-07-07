import * as React from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useListJournalEntries, useCreateJournalEntry, useGetMonthlyReport, getListJournalEntriesQueryKey } from "@workspace/api-client-react"
import { useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BookOpen, Calendar, Lightbulb, Trophy, AlertTriangle, GraduationCap } from "lucide-react"

const entrySchema = z.object({
  weekOf: z.string().min(1, "Date required"),
  learnings: z.string().min(10, "Be specific about what you learned"),
  achievements: z.string(),
  mistakes: z.string(),
  lessons: z.string(),
  mood: z.enum(["great", "good", "okay", "rough", "terrible"])
})

export default function JournalPage() {
  const queryClient = useQueryClient()
  const [isCreating, setIsCreating] = React.useState(false)
  
  const { data: entries, isLoading } = useListJournalEntries()
  const { data: monthlyReport } = useGetMonthlyReport({ query: { retry: false } })
  const createEntry = useCreateJournalEntry()

  const form = useForm<z.infer<typeof entrySchema>>({
    resolver: zodResolver(entrySchema),
    defaultValues: { 
      weekOf: new Date().toISOString().split('T')[0],
      learnings: "", achievements: "", mistakes: "", lessons: "", mood: "good" 
    }
  })

  const onSubmit = (values: z.infer<typeof entrySchema>) => {
    createEntry.mutate({ data: values }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListJournalEntriesQueryKey() })
        setIsCreating(false)
        form.reset()
      }
    })
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-card border border-border rounded-xl">
            <BookOpen className="w-8 h-8 text-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Growth Journal</h1>
            <p className="text-muted-foreground">Document learnings, spot recurring anti-patterns.</p>
          </div>
        </div>
        <Button onClick={() => setIsCreating(!isCreating)} variant={isCreating ? "outline" : "default"}>
          {isCreating ? "Cancel" : "New Entry"}
        </Button>
      </div>

      {isCreating && (
        <Card className="border-primary/50 shadow-lg shadow-primary/5">
          <CardHeader>
            <CardTitle>Log Weekly Reflection</CardTitle>
            <CardDescription>Honest reflection accelerates growth. Don't hide the mistakes.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Week Of</label>
                  <Input type="date" {...form.register("weekOf")} className="font-mono text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Overall Mood/Energy</label>
                  <Select onValueChange={(v) => form.setValue("mood", v as any)} defaultValue={form.getValues("mood")}>
                    <SelectTrigger><SelectValue placeholder="How was it?" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="great">Great - High Flow</SelectItem>
                      <SelectItem value="good">Good - Productive</SelectItem>
                      <SelectItem value="okay">Okay - Maintained</SelectItem>
                      <SelectItem value="rough">Rough - Blocked often</SelectItem>
                      <SelectItem value="terrible">Terrible - Burnout territory</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2"><Lightbulb className="w-4 h-4 text-yellow-500"/> Key Learnings</label>
                <Textarea placeholder="Technical concepts, system designs, tool quirks..." {...form.register("learnings")} className="min-h-[100px]" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2"><Trophy className="w-4 h-4 text-green-500"/> Achievements</label>
                <Textarea placeholder="What did you ship? PRs merged, bugs squashed?" {...form.register("achievements")} className="min-h-[80px]" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-destructive"/> Mistakes Made</label>
                  <Textarea placeholder="Bad architecture choices, broken prod, wasted time..." {...form.register("mistakes")} className="min-h-[100px]" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2"><GraduationCap className="w-4 h-4 text-primary"/> Lessons Extracted</label>
                  <Textarea placeholder="How will you avoid this mistake next time?" {...form.register("lessons")} className="min-h-[100px]" />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <Button type="submit" disabled={createEntry.isPending}>
                  {createEntry.isPending ? "Committing..." : "Commit Entry"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {monthlyReport && (
        <Card className="bg-card border-border">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center justify-between">
              <span>Monthly AI Synthesis: {monthlyReport.month}</span>
              <span className="text-2xl font-mono text-primary">{monthlyReport.growthScore}<span className="text-sm text-muted-foreground">/100</span></span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6 border-l-2 border-primary/50 pl-4 italic">
              "{monthlyReport.aiSummary}"
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-xs uppercase font-bold text-muted-foreground mb-2 flex items-center gap-1"><AlertTriangle className="w-3 h-3 text-destructive"/> Recurring Anti-patterns</h4>
                <ul className="text-sm space-y-1 text-destructive/90">
                  {monthlyReport.recurringMistakes.map((m, i) => <li key={i}>- {m}</li>)}
                </ul>
              </div>
              <div>
                <h4 className="text-xs uppercase font-bold text-muted-foreground mb-2 flex items-center gap-1"><Lightbulb className="w-3 h-3 text-primary"/> Consolidated Learnings</h4>
                <ul className="text-sm space-y-1">
                  {monthlyReport.keyLessons.map((l, i) => <li key={i}>- {l}</li>)}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <Calendar className="w-5 h-5 text-muted-foreground" /> Entry History
        </h3>
        
        {isLoading ? (
          <div className="animate-pulse space-y-4">
            {[1,2].map(i => <div key={i} className="h-40 bg-muted rounded-xl"></div>)}
          </div>
        ) : entries?.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground border border-dashed rounded-xl bg-muted/20">
            No journal entries yet. Start logging your growth.
          </div>
        ) : (
          <div className="grid gap-4">
            {entries?.map(entry => (
              <Card key={entry.id} className="overflow-hidden">
                <div className="flex border-b border-border/50 bg-muted/20 px-4 py-2 text-sm justify-between items-center">
                  <span className="font-mono font-medium">{new Date(entry.weekOf).toLocaleDateString(undefined, { dateStyle: 'medium'})}</span>
                  <span className="text-xs uppercase font-bold tracking-wider text-muted-foreground">Energy: {entry.mood}</span>
                </div>
                <CardContent className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-2 space-y-3">
                    <div>
                      <span className="text-xs font-bold uppercase text-muted-foreground">Learnings</span>
                      <p className="text-sm mt-1 whitespace-pre-wrap">{entry.learnings}</p>
                    </div>
                    {entry.aiInsights && (
                      <div className="p-3 bg-primary/5 rounded border border-primary/10 text-xs">
                        <span className="font-bold text-primary mb-1 block">AI Note:</span>
                        {entry.aiInsights}
                      </div>
                    )}
                  </div>
                  <div className="space-y-3">
                    <span className="text-xs font-bold uppercase text-muted-foreground">Mistakes & Lessons</span>
                    <div className="p-3 bg-destructive/5 rounded border border-destructive/10 text-sm">
                      {entry.mistakes}
                    </div>
                    <div className="p-3 bg-card border rounded text-sm font-medium">
                      {entry.lessons}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <span className="text-xs font-bold uppercase text-muted-foreground">Achievements</span>
                    <p className="text-sm mt-1 whitespace-pre-wrap text-green-500/80 font-medium">{entry.achievements}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
