import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useListGithubReports, useGenerateRoadmap, useGetRoadmap, getGetRoadmapQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Map, ArrowRight, CheckCircle2, Zap, Target, Sparkles, AlertCircle } from "lucide-react";
import { Link } from "wouter";

export const roadmapFormSchema = z.object({
  track: z.enum(["frontend", "backend", "fullstack", "ai", "cloud", "devops", "security", "data"], {
    errorMap: () => ({ message: "Please select a valid track" }),
  }),
  targetRole: z.string().min(1, "Target role is required"),
  currentLevel: z.enum(["junior", "mid", "senior", "staff", "principal"], {
    errorMap: () => ({ message: "Please select your current experience level" }),
  }),
});

export type RoadmapFormValues = z.infer<typeof roadmapFormSchema>;

export default function RoadmapPage() {
  const queryClient = useQueryClient();
  const { data: reports, isLoading: isLoadingReports } = useListGithubReports();
  const { data: roadmap, isLoading: isLoadingRoadmap } = useGetRoadmap();
  const generateRoadmap = useGenerateRoadmap();

  const [isGenerating, setIsGenerating] = React.useState(false);

  const form = useForm<RoadmapFormValues>({
    resolver: zodResolver(roadmapFormSchema),
    defaultValues: {
      track: "fullstack",
      targetRole: "Senior Fullstack Engineer",
      currentLevel: undefined as any, // Unset by default to test validation
    },
  });

  const latestReport = reports && reports.length > 0 ? (reports[0] as any) : null;

  const onSubmit = (values: RoadmapFormValues) => {
    generateRoadmap.mutate(
      { data: values },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetRoadmapQueryKey() });
          setIsGenerating(false);
        },
      }
    );
  };

  if (isLoadingReports || isLoadingRoadmap) {
    return (
      <div className="space-y-4 max-w-4xl mx-auto animate-pulse">
        <div className="h-12 w-64 bg-muted rounded" />
        <div className="h-48 bg-muted rounded-xl" />
        <div className="h-48 bg-muted rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Badge variant="outline" className="px-3 py-1 border-primary/30 text-primary font-mono text-xs mb-2">
            ENGINEERING ROADMAP
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight">Growth Roadmap</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Personalized milestone-driven roadmap customized to your target role and engineering level.
          </p>
        </div>
        <Button
          onClick={() => setIsGenerating(!isGenerating)}
          variant={isGenerating ? "outline" : "default"}
          className="gap-2 shrink-0"
        >
          <Sparkles className="w-4 h-4" />
          {isGenerating ? "Close Form" : "Generate Custom Roadmap"}
        </Button>
      </div>

      {/* Generator Form */}
      {isGenerating && (
        <Card className="border-primary/50 shadow-lg bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" /> Generate Personalized Roadmap
            </CardTitle>
            <CardDescription>
              Specify your domain track, target role, and current experience level.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Primary Track</label>
                  <Select
                    onValueChange={(v) => form.setValue("track", v as any, { shouldValidate: true })}
                    defaultValue={form.getValues("track")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select track" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="frontend">Frontend</SelectItem>
                      <SelectItem value="backend">Backend</SelectItem>
                      <SelectItem value="fullstack">Fullstack</SelectItem>
                      <SelectItem value="ai">AI / ML</SelectItem>
                      <SelectItem value="devops">DevOps / Infrastructure</SelectItem>
                      <SelectItem value="security">Security</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.track && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {form.formState.errors.track.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Target Role</label>
                  <Input placeholder="e.g. Staff Engineer" {...form.register("targetRole")} />
                  {form.formState.errors.targetRole && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {form.formState.errors.targetRole.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Current Level <span className="text-destructive">*</span></label>
                  <Select
                    onValueChange={(v) => form.setValue("currentLevel", v as any, { shouldValidate: true })}
                    value={form.watch("currentLevel")}
                  >
                    <SelectTrigger id="currentLevel-select">
                      <SelectValue placeholder="Select current level..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="junior">Junior Engineer</SelectItem>
                      <SelectItem value="mid">Mid-Level Engineer</SelectItem>
                      <SelectItem value="senior">Senior Engineer</SelectItem>
                      <SelectItem value="staff">Staff Engineer</SelectItem>
                      <SelectItem value="principal">Principal Engineer</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.currentLevel && (
                    <p id="currentLevel-error" className="text-xs text-destructive flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3 h-3" /> {form.formState.errors.currentLevel.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-border gap-3">
                <Button type="button" variant="ghost" onClick={() => setIsGenerating(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={generateRoadmap.isPending}>
                  {generateRoadmap.isPending ? "Generating Roadmap..." : "Generate Roadmap"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Existing Roadmap Milestones or Action Cards */}
      {roadmap ? (
        <div className="space-y-6">
          <Card className="border-primary/30 bg-primary/5 p-6">
            <h2 className="text-xl font-bold">{roadmap.targetRole} Roadmap</h2>
            <p className="text-sm text-muted-foreground mt-1 font-mono">
              Track: {roadmap.track} • Level: {roadmap.currentLevel} • Estimated Duration: {roadmap.estimatedWeeks} Weeks
            </p>
          </Card>

          {roadmap.milestones && roadmap.milestones.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold">Milestones</h3>
              {roadmap.milestones.map((m: any) => (
                <Card key={m.id} className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <Badge variant="outline" className="font-mono text-xs mb-1">
                        Week {m.weekNumber}
                      </Badge>
                      <h4 className="text-base font-bold">{m.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{m.description}</p>
                    </div>
                    {m.completed && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      ) : latestReport && latestReport.status === "completed" ? (
        <div className="space-y-6">
          <Badge variant="secondary" className="font-mono text-xs">
            NEXT 3 ACTION ITEMS (From latest repo analysis)
          </Badge>
          {((latestReport.recommendations as string[])?.slice(0, 3) || [
            "Refactor repository structure to separate core domain logic from framework handlers.",
            "Add automated CI/CD unit testing pipelines with continuous integration checks.",
            "Draft comprehensive API documentation and README architecture specs.",
          ]).map((action, idx) => (
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
      ) : (
        <div className="max-w-2xl mx-auto py-12 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center">
            <Map className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Micro-Roadmap Locked</h1>
          <p className="text-muted-foreground text-sm">
            Run your GitHub DNA analysis or generate a custom roadmap above to unlock tailored engineering growth items.
          </p>
          <Link href="/github-dna">
            <Button size="lg" className="gap-2">
              Analyze GitHub DNA <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
