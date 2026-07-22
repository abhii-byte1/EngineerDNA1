import * as React from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { motion } from "framer-motion"
import { useGetRoadmap, useGenerateRoadmap, useUpdateMilestone, getGetRoadmapQueryKey } from "@workspace/api-client-react"
import { useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Map as MapIcon, Flag, Compass, Calendar, CheckCircle2, ChevronRight, Book, Code2 } from "lucide-react"

const formSchema = z.object({
  track: z.enum(["frontend", "backend", "fullstack", "ai", "cloud", "devops", "security", "data"]),
  currentLevel: z.enum(["beginner", "junior", "mid", "senior"]),
  targetRole: z.string().min(2, "Required")
})

export default function RoadmapPage() {
  const queryClient = useQueryClient()
  const { data: roadmap, isError, isLoading } = useGetRoadmap({
    // @ts-expect-error Zodios provides queryKey internally but types are misaligned
    query: {
      retry: false // don't retry 404s
    }
  })
  
  const generate = useGenerateRoadmap()
  const updateMilestone = useUpdateMilestone()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { track: "frontend", currentLevel: "mid", targetRole: "" }
  })

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    generate.mutate({ data: values }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetRoadmapQueryKey() })
      }
    })
  }

  const toggleMilestone = (id: number, current: boolean) => {
    updateMilestone.mutate(
      { milestoneId: id, data: { completed: !current } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetRoadmapQueryKey() })
        }
      }
    )
  }

  if (isLoading) return <div className="animate-pulse h-64 bg-muted rounded-xl"></div>

  // If error (usually 404 Not Found), show the generation form
  if (isError || !roadmap) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-4 bg-primary/10 text-primary rounded-full mb-4">
            <MapIcon className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Generate Your Roadmap</h1>
          <p className="text-muted-foreground mt-2">Set your destination. We'll map the path.</p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Engineering Track</label>
                <Select onValueChange={(val) => form.setValue("track", val as any)} defaultValue={form.getValues("track")}>
                  <SelectTrigger><SelectValue placeholder="Select track" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="frontend">Frontend</SelectItem>
                    <SelectItem value="backend">Backend</SelectItem>
                    <SelectItem value="fullstack">Fullstack</SelectItem>
                    <SelectItem value="ai">AI / ML</SelectItem>
                    <SelectItem value="cloud">Cloud</SelectItem>
                    <SelectItem value="devops">DevOps</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Current Level</label>
                <Select onValueChange={(val) => form.setValue("currentLevel", val as any)} defaultValue={form.getValues("currentLevel")}>
                  <SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="junior">Junior</SelectItem>
                    <SelectItem value="mid">Mid-Level</SelectItem>
                    <SelectItem value="senior">Senior</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Target Role</label>
                <Input placeholder="e.g. Staff Staff Engineer, Tech Lead" {...form.register("targetRole")} />
              </div>

              <Button type="submit" className="w-full" disabled={generate.isPending}>
                {generate.isPending ? "Computing Path..." : "Generate Roadmap"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Display Roadmap
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="text-primary border-primary/30 uppercase tracking-widest">{roadmap.track}</Badge>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            <Badge variant="secondary" className="uppercase tracking-widest">{roadmap.currentLevel}</Badge>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Path to {roadmap.targetRole}</h1>
          <p className="text-muted-foreground mt-1">Estimated duration: {roadmap.estimatedWeeks} weeks</p>
        </div>
        <Button variant="outline" onClick={() => {/* Reset roadmap logic if needed */}} className="font-mono text-xs">
          Regenerate
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-primary uppercase tracking-wider flex items-center gap-2">
              <Flag className="w-4 h-4" /> Weekly Focus
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium text-lg">{roadmap.weeklyGoal}</p>
          </CardContent>
        </Card>

        <Card className="bg-secondary/5 border-secondary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-secondary uppercase tracking-wider flex items-center gap-2">
              <Compass className="w-4 h-4" /> Monthly Objective
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium text-lg">{roadmap.monthlyGoal}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-xl font-bold flex items-center gap-2 border-b border-border pb-2">
            <Calendar className="w-5 h-5 text-muted-foreground" /> Timeline
          </h3>
          
          <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
            {roadmap.milestones?.map((milestone, index) => (
              <div key={milestone.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                {/* Timeline dot */}
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-background shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow shadow-background z-10 ${milestone.completed ? 'bg-primary' : 'bg-muted'}`}>
                  {milestone.completed ? <CheckCircle2 className="w-4 h-4 text-primary-foreground" /> : <span className="text-xs font-mono">{milestone.weekNumber}</span>}
                </div>
                
                {/* Card */}
                <Card className={`w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] transition-colors ${milestone.completed ? 'border-primary/30 bg-primary/5' : ''}`}>
                  <CardHeader className="p-4 pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-base leading-tight">{milestone.title}</CardTitle>
                      <button onClick={() => toggleMilestone(milestone.id, milestone.completed)} className="shrink-0 p-1">
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${milestone.completed ? 'bg-primary border-primary text-primary-foreground' : 'border-muted-foreground/50'}`}>
                          {milestone.completed && <CheckCircle2 className="w-3 h-3" />}
                        </div>
                      </button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-sm text-muted-foreground mb-3">{milestone.description}</p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {milestone.skills.map(s => <Badge key={s} variant="outline" className="text-[10px] bg-background">{s}</Badge>)}
                    </div>
                    <ul className="space-y-1">
                      {milestone.tasks.map((task, i) => (
                        <li key={i} className="text-xs flex gap-2 text-muted-foreground font-medium">
                          <span className="text-primary/50">-</span> {task}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Book className="w-5 h-5" /> Resources</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">Projects</h4>
                <ul className="space-y-2">
                  {roadmap.recommendedProjects.map((p, i) => (
                    <li key={i} className="flex gap-2 text-sm"><Code2 className="w-4 h-4 shrink-0 mt-0.5 text-primary"/> <span>{p}</span></li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">Courses</h4>
                <ul className="space-y-2">
                  {roadmap.recommendedCourses.map((c, i) => (
                    <li key={i} className="text-sm p-2 rounded bg-muted/50 border border-border/50">{c}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">Books</h4>
                <ul className="space-y-2">
                  {roadmap.recommendedBooks.map((b, i) => (
                    <li key={i} className="text-sm p-2 rounded bg-muted/50 border border-border/50">{b}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
