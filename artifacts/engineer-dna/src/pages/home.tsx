import * as React from "react"
import { Link } from "wouter"
import { motion } from "framer-motion"
import { ArrowRight, Code2, Database, GitBranch, Github, Layers, Terminal, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"

import heroDnaImage from "@assets/generated_images/hero-dna.jpg"

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      {/* Navbar */}
      <header className="fixed top-0 inset-x-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-mono font-bold text-lg tracking-tighter">
            <div className="w-6 h-6 rounded bg-primary text-primary-foreground flex items-center justify-center text-xs">
              DNA
            </div>
            EngineerDNA
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Sign In
            </Link>
            <Link href="/login">
              <Button size="sm" className="font-mono text-xs uppercase tracking-wider">Start Analysis</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
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
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-mono mb-6 border border-primary/20">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              OS For Engineering Growth
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-[1.1] mb-6">
              Decode Your <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                Engineering DNA.
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-lg leading-relaxed">
              Stop guessing why you're not growing. AI-powered analysis of your GitHub, portfolio, and resume to tell you exactly where you're weak, where you're strong, and what to build next.
            </p>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Link href="/login">
                <Button size="lg" className="font-mono text-sm uppercase tracking-wider w-full sm:w-auto">
                  Initialize Scan <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <p className="text-xs text-muted-foreground font-mono">
                $ analyze --target=you
              </p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
            className="flex-1 w-full max-w-lg md:max-w-none relative"
          >
            <div className="aspect-square relative rounded-2xl overflow-hidden border border-border shadow-2xl shadow-primary/10">
              <img 
                src={heroDnaImage} 
                alt="Engineering DNA abstract visualization" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-background/80 via-transparent to-transparent" />
              
              {/* Overlay UI elements to make it look like a dashboard */}
              <div className="absolute bottom-6 left-6 right-6 p-4 rounded-xl glass-panel text-sm font-mono text-muted-foreground">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-foreground font-bold">DNA_MATCH</span>
                  <span className="text-primary">98.4%</span>
                </div>
                <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-[98.4%]" />
                </div>
                <div className="mt-4 flex gap-4 text-xs">
                  <span className="flex items-center gap-1"><GitBranch className="w-3 h-3 text-secondary"/> Arch</span>
                  <span className="flex items-center gap-1"><Terminal className="w-3 h-3 text-accent"/> Logic</span>
                  <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-primary"/> Perf</span>
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
              title="Portfolio DNA"
              description="Performance, accessibility, and UI/UX breakdown of your personal slice of the internet."
              command="$ analyze --source=url"
            />
            <ModuleCard 
              icon={<FileText className="text-accent" />}
              title="Resume DNA"
              description="Technical accuracy and impact scoring. Turns passive claims into active achievements."
              command="$ analyze --source=text"
            />
            <ModuleCard 
              icon={<Map className="text-primary" />}
              title="Engineering Roadmap"
              description="AI-generated week-by-week goals based on your gaps and target role."
              command="$ generate --type=roadmap"
            />
            <ModuleCard 
              icon={<BookOpen className="text-secondary" />}
              title="Growth Journal"
              description="Track learnings and mistakes. Spot recurring anti-patterns in your thinking."
              command="$ log --entry=today"
            />
            <ModuleCard 
              icon={<MessageSquare className="text-accent" />}
              title="AI Mentor"
              description="A senior engineer in your pocket to bounce architectural ideas off of."
              command="$ chat --role=senior"
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
            <Link href="/login">
              <Button size="lg" className="font-mono uppercase tracking-wider h-14 px-8 text-base">
                Stop Guessing. Start Growing.
              </Button>
            </Link>
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
          <p className="text-sm font-mono text-muted-foreground">
            System Online. Awaiting input.
          </p>
        </div>
      </footer>
    </div>
  )
}

function ModuleCard({ icon, title, description, command }: { icon: React.ReactNode, title: string, description: string, command: string }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="p-6 rounded-xl border border-border bg-card flex flex-col h-full hover:border-primary/50 transition-colors group"
    >
      <div className="w-12 h-12 rounded-lg bg-background border border-border flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-bold tracking-tight mb-3">{title}</h3>
      <p className="text-muted-foreground mb-8 flex-1">{description}</p>
      <div className="mt-auto px-3 py-2 bg-muted rounded border border-border/50 font-mono text-xs text-muted-foreground">
        {command}
      </div>
    </motion.div>
  )
}
