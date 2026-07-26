import * as React from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useListGoals, useCreateGoal, useUpdateGoal, useDeleteGoal, getListGoalsQueryKey } from "@workspace/api-client-react"
import { useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Target, Trash2, CheckCircle2, PlayCircle, PauseCircle, XCircle } from "lucide-react"
import { motion } from "framer-motion"
import { staggerContainer, staggerItem } from "@/lib/animations"

const goalSchema = z.object({
  title: z.string().min(3, "Title required"),
  description: z.string().optional(),
  category: z.enum(["skill", "project", "career", "learning", "habit"]),
  priority: z.enum(["high", "medium", "low"]),
  targetDate: z.string().optional()
})

export default function GoalsPage() {
  const queryClient = useQueryClient()
  const { data: goals, isLoading } = useListGoals()
  
  const createGoal = useCreateGoal()
  const updateGoal = useUpdateGoal()
  const deleteGoal = useDeleteGoal()

  const [isCreating, setIsCreating] = React.useState(false)

  const form = useForm<z.infer<typeof goalSchema>>({
    resolver: zodResolver(goalSchema),
    defaultValues: { category: "skill", priority: "medium", title: "", description: "" }
  })

  const onSubmit = (values: z.infer<typeof goalSchema>) => {
    createGoal.mutate({ data: values }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListGoalsQueryKey() })
        setIsCreating(false)
        form.reset()
      }
    })
  }

  const handleUpdateProgress = (id: number, progress: number) => {
    updateGoal.mutate({ id, data: { progress } }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getListGoalsQueryKey() })
    })
  }

  const handleUpdateStatus = (id: number, status: "active"|"completed"|"paused"|"abandoned") => {
    const payload: any = { status }
    if (status === "completed") payload.progress = 100
    
    updateGoal.mutate({ id, data: payload }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getListGoalsQueryKey() })
    })
  }

  const handleDelete = (id: number) => {
    deleteGoal.mutate({ id }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getListGoalsQueryKey() })
    })
  }

  const activeGoals = goals?.filter(g => g.status === "active") || []
  const otherGoals = goals?.filter(g => g.status !== "active") || []

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 text-primary rounded-xl">
            <Target className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Active Operations</h1>
            <p className="text-muted-foreground">Track measurable progress toward engineering goals.</p>
          </div>
        </div>
        <Button onClick={() => setIsCreating(!isCreating)} variant={isCreating ? "outline" : "default"}>
          {isCreating ? "Cancel" : "Define Goal"}
        </Button>
      </div>

      {isCreating && (
        <Card className="border-primary/50 shadow-lg">
          <CardHeader>
            <CardTitle>Define New Parameter</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Title</label>
                  <Input placeholder="e.g. Master React Server Components" {...form.register("title")} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Input placeholder="Measurable outcome..." {...form.register("description")} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <Select onValueChange={v => form.setValue("category", v as any)} defaultValue={form.getValues("category")}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="skill">Skill Acquisition</SelectItem>
                      <SelectItem value="project">Project Execution</SelectItem>
                      <SelectItem value="career">Career Milestone</SelectItem>
                      <SelectItem value="learning">Learning Path</SelectItem>
                      <SelectItem value="habit">Engineering Habit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Priority</label>
                  <Select onValueChange={v => form.setValue("priority", v as any)} defaultValue={form.getValues("priority")}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">P0 - Critical</SelectItem>
                      <SelectItem value="medium">P1 - Medium</SelectItem>
                      <SelectItem value="low">P2 - Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="pt-2 flex justify-end">
                <Button type="submit" disabled={createGoal.isPending}>Commit Parameter</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
          {[1,2,3,4].map(i => <div key={i} className="h-48 bg-muted rounded-xl"></div>)}
        </div>
      ) : (
        <div className="space-y-12">
          <div>
            <h3 className="text-lg font-bold mb-4 font-mono tracking-tight uppercase text-primary border-b border-border pb-2">Active</h3>
            {activeGoals.length === 0 ? (
              <p className="text-muted-foreground text-sm">No active goals. Define parameters to begin.</p>
            ) : (
              <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {activeGoals.map(goal => (
                  <motion.div key={goal.id} variants={staggerItem}>
                    <GoalCard 
                      goal={goal} 
                      onProgress={(p) => handleUpdateProgress(goal.id, p)} 
                      onStatus={(s) => handleUpdateStatus(goal.id, s)}
                      onDelete={() => handleDelete(goal.id)}
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>

          {otherGoals.length > 0 && (
            <div className="opacity-70">
              <h3 className="text-lg font-bold mb-4 font-mono tracking-tight uppercase text-muted-foreground border-b border-border pb-2">Archive / Paused</h3>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {otherGoals.map(goal => (
                  <GoalCard 
                    key={goal.id} 
                    goal={goal} 
                    onProgress={(p) => handleUpdateProgress(goal.id, p)} 
                    onStatus={(s) => handleUpdateStatus(goal.id, s)}
                    onDelete={() => handleDelete(goal.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function GoalCard({ goal, onProgress, onStatus, onDelete }: { goal: any, onProgress: (v: number) => void, onStatus: (s: any) => void, onDelete: () => void }) {
  const isCompleted = goal.status === "completed"
  
  return (
    <Card className={`overflow-hidden transition-all ${isCompleted ? 'bg-card border-green-500/20' : 'bg-card'}`}>
      <div className={`h-1 w-full ${goal.priority === 'high' ? 'bg-destructive' : goal.priority === 'medium' ? 'bg-primary' : 'bg-muted-foreground'}`} />
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex gap-2 mb-2">
              <Badge variant="outline" className="font-mono bg-background text-[10px]">{goal.category}</Badge>
              <Badge variant="secondary" className="font-mono text-[10px]">{goal.status}</Badge>
            </div>
            <CardTitle className={`text-lg ${isCompleted ? 'line-through opacity-70' : ''}`}>{goal.title}</CardTitle>
            {goal.description && <CardDescription className="mt-1">{goal.description}</CardDescription>}
          </div>
          <div className="flex gap-1">
            {goal.status === "active" ? (
              <>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-green-500 hover:text-green-400 hover:bg-green-500/10" onClick={() => onStatus("completed")}><CheckCircle2 className="w-4 h-4" /></Button>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-yellow-500 hover:text-yellow-400 hover:bg-yellow-500/10" onClick={() => onStatus("paused")}><PauseCircle className="w-4 h-4" /></Button>
              </>
            ) : (
              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => onStatus("active")}><PlayCircle className="w-4 h-4" /></Button>
            )}
            <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={onDelete}><Trash2 className="w-4 h-4" /></Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between text-sm font-mono text-muted-foreground">
            <span>Progress</span>
            <span>{goal.progress}%</span>
          </div>
          <Slider 
            defaultValue={[goal.progress]} 
            max={100} step={5} 
            disabled={goal.status !== "active"}
            onValueCommit={(val) => onProgress(val[0])}
            className={isCompleted ? "opacity-50 grayscale" : ""}
          />
        </div>
      </CardContent>
    </Card>
  )
}
