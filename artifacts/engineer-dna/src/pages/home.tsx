import * as React from "react"
import { Link } from "wouter"
import { motion } from "framer-motion"
import { ArrowRight, BookOpen, Code2, Database, FileText, GitBranch, Github, Globe, Layers, Map as MapIcon, MessageSquare, Terminal, UserPlus, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SpotlightCard } from "@/components/ui/spotlight"
import { BorderBeam } from "@/components/ui/border-beam"
import { AnimatedGridBg } from "@/components/ui/animated-grid-bg"
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/animations"

import heroDnaImage from "@assets/generated_images/hero-dna.jpg"

const DnaHelix3D = React.lazy(() => import("@/components/dna-helix-3d"))

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      {/* Navbar */}
      <header className="fixed top-0 inset-x-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 font-mono font-bold text-lg tracking-tighter hover:opacity-90 transition-opacity">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center text-xs font-extrabold shadow-md shadow-blue-500/20">
              DNA
            </div>
            <span className="text-foreground text-xl font-bold tracking-tight">EngineerDNA</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How it Works</a>
            <a href="#privacy" className="hover:text-foreground transition-colors">Privacy</a>
            <Link href="/roast" className="text-amber-400 hover:text-amber-300 font-mono text-xs uppercase tracking-wider flex items-center gap-1 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
              Roast 🔥
            </Link>
          </nav>

          <div className="flex items-center gap-3.5">
            <Link href="/login">
              <Button
                variant="outline"
                className="h-12 px-6 rounded-xl bg-slate-900/60 backdrop-blur-md border-blue-500/30 text-foreground font-semibold text-sm hover:bg-slate-800/80 hover:border-blue-400/60 hover:shadow-lg hover:shadow-blue-500/20 hover:-translate-y-0.5 transition-all duration-200 group"
              >
                Sign In
                <ArrowRight className="w-4 h-4 ml-2 text-blue-400 group-hover:translate-x-0.5 transition-transform" />
              </Button>
            </Link>
            <Link href="/login">
              <Button
                className="h-12 px-6 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold text-sm shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all duration-200 group"
              >
                Get Started
                <UserPlus className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden" id="features">
        <AnimatedGridBg />
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] opacity-50 pointer-events-none" />
          <div className="absolute top-1/2 left-1/4 w-[500px] h-[500px] bg-secondary/20 rounded-full blur-[100px] opacity-30 pointer-events-none" />
        </div>

        <div className="container relative z-10 mx-auto px-6 flex flex-col md:flex-row items-center gap-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex-1 max-w-2xl"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 text-blue-400 text-xs font-mono mb-6 border border-blue-500/20 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              DSA For Engineering Growth
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-[1.1] mb-6">
              Decode Your <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
                Engineering DNA.
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-lg leading-relaxed">
              Stop guessing why you're not growing. AI-powered analysis of your GitHub and resume to tell you exactly where you're weak, where you're strong, and what to build next.
            </p>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-8">
              <Link href="/login">
                <Button
                  size="lg"
                  className="h-14 px-8 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold text-base shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/45 hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center group w-full sm:w-auto"
                >
                  <Github className="w-5 h-5 mr-2.5" />
                  Get Started with GitHub
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
                </Button>
              </Link>

              <Link href="/login">
                <Button
                  variant="outline"
                  size="lg"
                  className="h-14 px-8 rounded-xl bg-slate-900/60 backdrop-blur-md border-blue-500/30 text-foreground font-semibold text-base hover:bg-slate-800/80 hover:border-blue-400/60 hover:shadow-lg hover:shadow-blue-500/20 hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center group w-full sm:w-auto"
                >
                  Sign In
                  <ArrowRight className="w-4 h-4 ml-2 text-blue-400 group-hover:translate-x-0.5 transition-transform" />
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-xs font-medium text-muted-foreground pt-2">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <span>AI-Powered Insights</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                <span>Track Real Progress</span>
              </div>
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-purple-400 flex-shrink-0" />
                <span>100% Secure & Private</span>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
            className="flex-1 w-full max-w-lg lg:max-w-none relative"
          >
            <div className="aspect-square relative rounded-2xl overflow-hidden border border-border shadow-2xl shadow-primary/10 bg-card/40 backdrop-blur-xl flex items-center justify-center">
              <React.Suspense fallback={<div className="w-full h-full flex items-center justify-center text-xs font-mono text-muted-foreground animate-pulse">Initializing 3D DNA Canvas...</div>}>
                <DnaHelix3D />
              </React.Suspense>

              <div className="absolute inset-0 bg-gradient-to-tr from-background/80 via-transparent to-transparent pointer-events-none" />
              
              {/* Overlay UI elements */}
              <div className="absolute bottom-6 left-6 right-6 p-4 rounded-xl glass-panel text-sm font-mono text-muted-foreground backdrop-blur-2xl border border-blue-500/20 bg-slate-950/60 shadow-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-foreground font-bold">DNA_MATCH</span>
                  <span className="text-blue-400 font-bold">88.4%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 w-[88.4%]" />
                </div>
                <div className="mt-4 flex gap-4 text-xs">
                  <span className="flex items-center gap-1.5 text-blue-400"><GitBranch className="w-3.5 h-3.5"/> Arch</span>
                  <span className="flex items-center gap-1.5 text-indigo-400"><Terminal className="w-3.5 h-3.5"/> Logic</span>
                  <span className="flex items-center gap-1.5 text-purple-400"><Zap className="w-3.5 h-3.5"/> Perf</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Modules Section */}
      <section className="py-24 bg-card/30 border-y border-border">
        <div className="container mx-auto px-6">
          <div className="mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">A complete diagnostic suite.</h2>
            <p className="text-muted-foreground max-w-2xl text-lg">We don't just look at your code. We look at how you present it, how you write about it, and how you plan to improve it.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ModuleCard 
              icon={<Github className="text-primary" />}
              title="GitHub DNA"
              description="Deep analysis of your commit history, architecture patterns, and tech stack choices."
              command="$ analyze --source=github"
            />
            <ModuleCard 
              icon={<Globe className="text-secondary" />}
              title="Public Scorecard"
              description="Shareable public profile showing developer archetypes, score percentiles, and README SVG badge."
              command="$ share --profile=public"
            />
            <ModuleCard 
              icon={<FileText className="text-accent" />}
              title="Resume DNA"
              description="Technical accuracy and impact scoring. Turns passive claims into active achievements."
              command="$ analyze --source=resume"
            />
            <ModuleCard 
              icon={<MapIcon className="text-primary" />}
              title="Next 3 Things Roadmap"
              description="Targeted micro-roadmap recommending the next 3 high-impact skills to level up."
              command="$ generate --type=roadmap"
            />
            <ModuleCard 
              icon={<BookOpen className="text-secondary" />}
              title="Leaderboard & Matchup"
              description="Compare developer scorecards side-by-side and view track/level percentiles."
              command="$ rank --global"
            />
            <ModuleCard 
              icon={<MessageSquare className="text-accent" />}
              title="Interview Simulator"
              description="Bounded technical interview practice tailored to your tech stack and experience level."
              command="$ start --mode=interview"
            />
          </div>
        </div>
      </section>

      {/* Pain point section */}
      <section className="py-32 relative overflow-hidden">
        <div className="container mx-auto px-6 relative z-10 text-center max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-8">
              "Why am I stuck at mid-level?"
            </h2>
            <p className="text-xl text-muted-foreground mb-12 leading-relaxed">
              Because nobody is reviewing your code outside of work. Because your side projects are abandoned. Because you don't know what you don't know. EngineerDNA gives you the brutal, objective feedback you need to break through the plateau.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/roast">
                <Button size="lg" className="font-mono uppercase tracking-wider h-14 px-8 text-base">
                  Roast My GitHub 🔥
                </Button>
              </Link>
              <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                or sign in for full tracking →
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Trust & Privacy Section ── */}
      <section className="py-24 border-t border-border bg-card/20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-14"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono mb-4">
              <span className="w-2 h-2 rounded-full bg-emerald-400" /> Privacy First
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Your data. Your control.</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              We ask for the minimum possible GitHub permissions. Here's exactly what we can and cannot do — no hidden fine print.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                colorClasses: "border-emerald-500/20 bg-emerald-500/5",
                iconBgClasses: "bg-emerald-500/10",
                icon: <Layers className="w-5 h-5 text-emerald-400" />,
                title: "Read-only GitHub access",
                desc: "We request only read:user and user:email OAuth scopes. GitHub enforces this — we literally cannot write to your account."
              },
              {
                colorClasses: "border-blue-500/20 bg-blue-500/5",
                iconBgClasses: "bg-blue-500/10",
                icon: <Database className="w-5 h-5 text-blue-400" />,
                title: "Data stays yours",
                desc: "Your analysis, reports, and resume are stored only to power your dashboard. Never sold, never shared with advertisers."
              },
              {
                colorClasses: "border-violet-500/20 bg-violet-500/5",
                iconBgClasses: "bg-violet-500/10",
                icon: <Code2 className="w-5 h-5 text-violet-400" />,
                title: "Delete anytime",
                desc: "One click in Settings removes your account and every byte of data permanently. No hoops, no waiting period."
              }
            ].map(({ colorClasses, iconBgClasses, icon, title, desc }) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
                className={`p-6 rounded-xl border ${colorClasses}`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${iconBgClasses}`}>
                  {icon}
                </div>
                <h3 className="font-bold text-lg mb-2">{title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>

          {/* GitHub scope callout */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-10 max-w-2xl mx-auto flex items-center gap-4 p-4 rounded-xl bg-muted/40 border border-border font-mono text-sm"
          >
            <Github className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            <div>
              <span className="text-muted-foreground">OAuth scopes we request: </span>
              <span className="text-primary font-semibold">read:user user:email</span>
              <span className="text-muted-foreground"> — public profile and email only.</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border bg-card">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-mono font-bold text-sm tracking-tighter text-muted-foreground">
            <div className="w-5 h-5 rounded bg-muted text-foreground flex items-center justify-center text-[10px]">
              DNA
            </div>
            EngineerDNA
          </div>
          <div className="flex items-center gap-6">
            <Link href="/about" className="text-xs font-mono text-muted-foreground hover:text-foreground transition-colors">
              About & Developer
            </Link>
            <p className="text-sm font-mono text-muted-foreground">
              System Online. Awaiting input.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}


function ModuleCard({ icon, title, description, command }: { icon: React.ReactNode, title: string, description: string, command: string }) {
  return (
    <SpotlightCard className="rounded-xl border border-border bg-card/60 backdrop-blur-xl h-full hover:border-primary/40 transition-colors">
      <motion.div 
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
        className="p-6 flex flex-col h-full group"
      >
        <div className="w-12 h-12 rounded-lg bg-background border border-border flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <h3 className="text-xl font-bold tracking-tight mb-3">{title}</h3>
        <p className="text-muted-foreground mb-8 flex-1 text-sm leading-relaxed">{description}</p>
        <div className="mt-auto px-3 py-2 bg-muted/60 rounded border border-border/50 font-mono text-xs text-muted-foreground">
          {command}
        </div>
      </motion.div>
    </SpotlightCard>
  )
}
