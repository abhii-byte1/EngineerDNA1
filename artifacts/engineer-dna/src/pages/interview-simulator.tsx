import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { BrainCircuit, Play, Send, CheckCircle2, ArrowRight, Award, Trophy, AlertTriangle, Sparkles, MessageSquare } from "lucide-react";

interface InterviewMessage {
  role: "interviewer" | "candidate";
  content: string;
  timestamp: string;
}

interface InterviewFeedback {
  overallScore: number;
  communicationScore: number;
  technicalDepthScore: number;
  summary: string;
  keyStrengths: string[];
  growthAreas: string[];
}

interface InterviewSession {
  id: number;
  track: string;
  type: string;
  level: string;
  questionCount: number;
  maxQuestions: number;
  status: "active" | "completed";
  transcript: InterviewMessage[];
  feedback?: InterviewFeedback;
}

export default function InterviewSimulator() {
  const [track, setTrack] = React.useState("Full Stack");
  const [type, setType] = React.useState<"behavioral" | "system_design" | "coding">("behavioral");
  const [level, setLevel] = React.useState<"junior" | "mid" | "senior" | "staff">("mid");

  const [activeSession, setActiveSession] = React.useState<InterviewSession | null>(null);
  const [answer, setAnswer] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const { toast } = useToast();

  const startSession = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/interview-simulator/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ track, type, level }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to start interview session.");
      }

      setActiveSession(json);
    } catch (err) {
      toast({
        title: "Session Error",
        description: err instanceof Error ? err.message : "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!activeSession || !answer.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/interview-simulator/sessions/${activeSession.id}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answer: answer.trim() }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to submit answer.");
      }

      setActiveSession(json);
      setAnswer("");
    } catch (err) {
      toast({
        title: "Submission Error",
        description: err instanceof Error ? err.message : "Could not submit response.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto p-4 md:p-8">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 bg-primary/10 text-primary rounded-xl">
          <BrainCircuit className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Interview Readiness Simulator</h1>
          <p className="text-muted-foreground text-sm">
            Structured, session-bounded AI technical interview practice calibrated to your track & level.
          </p>
        </div>
      </div>

      {!activeSession && (
        <Card className="border-border bg-card/60 backdrop-blur-xl">
          <CardHeader>
            <CardTitle>Configure Session</CardTitle>
            <CardDescription>
              Behavioral interviews are grounded directly in your GitHub profile & repos. System design and coding questions are calibrated to your level.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Interview Type</label>
                <Select value={type} onValueChange={(val: any) => setType(val)}>
                  <SelectTrigger className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="behavioral">Behavioral (Repo-Grounded)</SelectItem>
                    <SelectItem value="system_design">System Design</SelectItem>
                    <SelectItem value="coding">Architecture / Code Quality</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Track</label>
                <Select value={track} onValueChange={setTrack}>
                  <SelectTrigger className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Full Stack">Full Stack</SelectItem>
                    <SelectItem value="Backend">Backend</SelectItem>
                    <SelectItem value="Frontend">Frontend</SelectItem>
                    <SelectItem value="DevOps">DevOps</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Level</label>
                <Select value={level} onValueChange={(val: any) => setLevel(val)}>
                  <SelectTrigger className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="junior">Junior</SelectItem>
                    <SelectItem value="mid">Mid-Level</SelectItem>
                    <SelectItem value="senior">Senior</SelectItem>
                    <SelectItem value="staff">Staff / Principal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 text-xs text-muted-foreground flex items-center justify-between">
              <span>Free Tier: 5 Bounded Sessions per Month</span>
              <Badge variant="outline" className="font-mono border-primary/30 text-primary">
                BOUNDED 4-QUESTION SESSION
              </Badge>
            </div>

            <Button onClick={startSession} disabled={loading} size="lg" className="w-full font-bold gap-2">
              {loading ? "Initializing..." : <>Start Mock Interview <Play className="w-4 h-4" /></>}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Active Q&A Transcript */}
      {activeSession && activeSession.status === "active" && (
        <div className="space-y-6">
          {/* Progress Header */}
          <div className="flex justify-between items-center bg-card border border-border p-4 rounded-xl">
            <div className="flex items-center gap-2 font-mono text-sm">
              <Badge variant="secondary" className="uppercase">{activeSession.type}</Badge>
              <span>•</span>
              <span className="capitalize">{activeSession.level}</span>
            </div>
            <div className="font-mono text-xs text-primary font-bold">
              Question {activeSession.questionCount} of {activeSession.maxQuestions}
            </div>
          </div>

          {/* Transcript Messages */}
          <div className="space-y-4">
            {activeSession.transcript?.map((msg, idx) => (
              <div
                key={idx}
                className={`p-5 rounded-2xl border text-sm space-y-2 ${
                  msg.role === "interviewer"
                    ? "bg-primary/10 border-primary/20 text-foreground mr-8"
                    : "bg-muted/60 border-border text-foreground ml-8"
                }`}
              >
                <div className="flex items-center justify-between font-mono text-xs opacity-70">
                  <span className="font-bold uppercase tracking-wider">
                    {msg.role === "interviewer" ? "AI Principal Interviewer" : "Candidate Response"}
                  </span>
                </div>
                <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
              </div>
            ))}
          </div>

          {/* Answer Input */}
          <Card className="border-border bg-card">
            <CardContent className="p-4 space-y-4">
              <Textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Type your response here... (Be specific about trade-offs, architecture decisions, or team impact)"
                className="min-h-[140px] font-sans text-sm bg-background"
              />
              <div className="flex justify-end">
                <Button onClick={submitAnswer} disabled={loading || !answer.trim()} className="gap-2 font-bold">
                  {loading ? "Processing..." : <>Submit Answer <Send className="w-4 h-4" /></>}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Final Evaluated Session Report */}
      {activeSession && activeSession.status === "completed" && activeSession.feedback && (
        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
          <Card className="border-primary/30 bg-card/60 p-8 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border pb-6">
              <div>
                <Badge variant="outline" className="text-primary border-primary/30 font-mono text-xs mb-1">
                  INTERVIEW EVALUATION REPORT
                </Badge>
                <h2 className="text-2xl font-bold font-mono">Session #{activeSession.id} Summary</h2>
                <p className="text-sm text-muted-foreground mt-1">{activeSession.feedback.summary}</p>
              </div>

              <div className="flex items-center gap-4 bg-background border border-border p-4 rounded-xl shrink-0">
                <div className="text-right">
                  <div className="text-xs font-semibold text-muted-foreground">OVERALL</div>
                  <div className="text-3xl font-extrabold font-mono text-primary">
                    {activeSession.feedback.overallScore}
                  </div>
                </div>
              </div>
            </div>

            {/* Score Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-background border border-border flex justify-between items-center">
                <span className="text-sm font-medium">Communication & Structure</span>
                <span className="font-mono font-bold text-lg text-primary">{activeSession.feedback.communicationScore}/100</span>
              </div>
              <div className="p-4 rounded-xl bg-background border border-border flex justify-between items-center">
                <span className="text-sm font-medium">Technical Depth & Trade-offs</span>
                <span className="font-mono font-bold text-lg text-primary">{activeSession.feedback.technicalDepthScore}/100</span>
              </div>
            </div>

            {/* Key Strengths & Growth Areas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              <div className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-green-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Key Strengths
                </h3>
                <div className="space-y-2">
                  {activeSession.feedback.keyStrengths.map((str, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-xs font-medium">
                      {str}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> Growth Opportunities
                </h3>
                <div className="space-y-2">
                  {activeSession.feedback.growthAreas.map((area, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs font-medium">
                      {area}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-border">
              <Button onClick={() => setActiveSession(null)} className="gap-2 font-bold">
                Start New Session <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
