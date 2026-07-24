import * as React from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Github, 
  Linkedin, 
  Globe, 
  Shield, 
  Eye, 
  CheckCircle2, 
  Code2, 
  Cpu, 
  Layers, 
  ArrowRight,
  Terminal,
  Zap,
  Lock,
  Mail
} from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground py-12 px-4 md:px-8 max-w-4xl mx-auto space-y-12 animate-in fade-in duration-300">
      {/* Header / Hero */}
      <div className="text-center space-y-4">
        <Badge variant="outline" className="px-4 py-1 border-primary/30 text-primary font-mono text-xs">
          TRANSPARENT PRODUCT MANIFESTO
        </Badge>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight font-mono">
          About EngineerDNA
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
          An objective engineering growth OS built for software developers, computer science students, and engineers looking to decode their code choices, benchmark skills, and target growth gaps.
        </p>
      </div>

      {/* 1. What EngineerDNA is */}
      <Card className="border-border bg-card/50 backdrop-blur-xl p-6 md:p-8 space-y-4">
        <h2 className="text-2xl font-bold font-mono tracking-tight flex items-center gap-2">
          <Terminal className="w-5 h-5 text-primary" /> What We Build & Why
        </h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Engineers often hit growth plateaus because code reviews at work are limited to pull request scope, side projects sit abandoned in private repos, and career feedback is often vague. EngineerDNA turns your public repository history and technical artifacts into an objective, data-backed assessment of your tech stack, architecture choices, and developer archetype.
        </p>
      </Card>

      {/* 2. How Analysis Works */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold font-mono tracking-tight flex items-center gap-2">
          <Cpu className="w-5 h-5 text-secondary" /> How Analysis Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-border bg-card/40 p-5 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-mono font-bold text-xs">
              01
            </div>
            <h3 className="font-bold text-sm">Public Data Fetching</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              We query public GitHub API endpoints for commit logs, languages, and repo topic structures using read-only scopes.
            </p>
          </Card>

          <Card className="border-border bg-card/40 p-5 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center font-mono font-bold text-xs">
              02
            </div>
            <h3 className="font-bold text-sm">Gemini AI Evaluation</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Gemini evaluates engineering depth, architecture patterns, and top strengths, categorizing your profile into 1 of 9 fixed Developer Archetypes.
            </p>
          </Card>

          <Card className="border-border bg-card/40 p-5 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-mono font-bold text-xs">
              03
            </div>
            <h3 className="font-bold text-sm">Real SQL Percentiles</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your overall score is benchmarked against real completed user reports using exact database percentile queries.
            </p>
          </Card>
        </div>
      </div>

      {/* 3. Data Promise & Privacy */}
      <Card className="border-emerald-500/20 bg-emerald-500/5 p-6 md:p-8 space-y-4">
        <h2 className="text-xl font-bold font-mono tracking-tight text-emerald-400 flex items-center gap-2">
          <Shield className="w-5 h-5" /> Data Promise & Privacy
        </h2>
        <ul className="space-y-2 text-xs md:text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span><strong>Read-Only Access:</strong> We request only <code className="text-primary font-mono">read:user</code> and <code className="text-primary font-mono">user:email</code> OAuth scopes. We cannot write, push, or modify your repositories.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span><strong>Private Profiles Default:</strong> Scorecards are set to private by default (<code className="font-mono">isPublic = false</code>) until you explicitly opt in to share a public link.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span><strong>Never Sold or Shared:</strong> Your personal data, analysis results, and email are stored solely to power your dashboard.</span>
          </li>
        </ul>
      </Card>

      {/* 4. Built By Developer Section */}
      <Card className="border-border bg-card/60 backdrop-blur-xl p-6 md:p-8 space-y-6">
        <div className="space-y-2">
          <Badge variant="secondary" className="font-mono text-xs">DEVELOPER SPOTLIGHT</Badge>
          <h2 className="text-2xl font-bold font-mono tracking-tight">Built by Abhishek Meena</h2>
          <p className="text-sm text-muted-foreground">
            Full Stack Developer (MERN) — B.Tech, Computer Science & Engineering (AI & ML), Oriental Institute of Science and Technology, Bhopal (2023–2027)
          </p>
        </div>

        <blockquote className="p-4 rounded-xl bg-muted/40 border-l-4 border-primary text-xs md:text-sm italic text-muted-foreground">
          "Built EngineerDNA as a full-stack MERN project — React/Vite/Tailwind frontend, Node/Express backend, PostgreSQL database — combining a background in AI/ML with hands-on product development."
        </blockquote>

        {/* Developer Links */}
        <div className="flex flex-wrap gap-3 pt-2">
          <a
            href="https://github.com/abhii-byte1"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 text-xs font-semibold font-mono border border-border transition-colors"
          >
            <Github className="w-4 h-4 text-primary" /> GitHub Profile
          </a>
          <a
            href="https://linkedin.com/in/abhishek-meena-0647663a0"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 text-xs font-semibold font-mono border border-border transition-colors"
          >
            <Linkedin className="w-4 h-4 text-secondary" /> LinkedIn Profile
          </a>
          <a
            href="https://portfolio-xi-seven-wwkbi54bx9.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 text-xs font-semibold font-mono border border-border transition-colors"
          >
            <Globe className="w-4 h-4 text-amber-400" /> Developer Portfolio
          </a>
        </div>
      </Card>

      {/* CTA */}
      <div className="text-center p-8 rounded-2xl border border-primary/20 bg-primary/5 space-y-4">
        <h3 className="text-xl font-bold font-mono">Ready to analyze your GitHub DNA?</h3>
        <Link href="/roast">
          <Button size="lg" className="gap-2 font-bold">
            Start Free Assessment <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
