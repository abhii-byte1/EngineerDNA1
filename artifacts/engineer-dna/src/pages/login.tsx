import * as React from "react"
import { Link } from "wouter"
import { Github, Code2, Terminal } from "lucide-react"

export default function Login() {
  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Left side - Visual/Brand */}
      <div className="hidden md:flex flex-1 bg-card/50 border-r border-border relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10" />
        
        <div className="relative z-10 max-w-lg">
          <div className="flex items-center gap-3 font-mono font-bold text-3xl tracking-tighter mb-8">
            <div className="w-10 h-10 rounded-lg bg-primary text-primary-foreground flex items-center justify-center text-lg">
              DNA
            </div>
            EngineerDNA
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-6">
            The standard for engineering excellence.
          </h1>
          <p className="text-xl text-muted-foreground">
            Authenticate to access your unified growth dashboard, AI architecture reviews, and objective skill analysis.
          </p>
          
          <div className="mt-12 space-y-4 font-mono text-sm text-muted-foreground/80">
            <div className="flex items-center gap-3">
              <Code2 className="w-4 h-4" /> Analyzing repository patterns...
            </div>
            <div className="flex items-center gap-3">
              <Terminal className="w-4 h-4" /> Computing technical debt...
            </div>
            <div className="flex items-center gap-3">
              <Github className="w-4 h-4" /> Generating growth vectors...
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Auth */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 relative">
        <Link href="/" className="absolute top-8 left-8 md:hidden flex items-center gap-2 font-mono font-bold text-lg tracking-tighter">
          <div className="w-6 h-6 rounded bg-primary text-primary-foreground flex items-center justify-center text-xs">
            DNA
          </div>
          EngineerDNA
        </Link>

        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">System Access</h2>
            <p className="text-muted-foreground">Log in to view your engineering DNA</p>
          </div>

          <div className="space-y-4 pt-4">
            <a 
              href="/api/auth/github"
              target="_top"
              className="flex items-center justify-center w-full gap-3 bg-foreground text-background hover:bg-foreground/90 h-12 rounded-md font-medium transition-colors"
            >
              <Github className="w-5 h-5" />
              Sign in with GitHub
            </a>
            
            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase font-mono">
                <span className="bg-background px-2 text-muted-foreground">Development Only</span>
              </div>
            </div>

            <a 
              href="/api/auth/dev-login"
              className="flex items-center justify-center w-full gap-3 border border-border bg-card hover:bg-muted h-12 rounded-md font-medium text-muted-foreground transition-colors"
            >
              <Terminal className="w-4 h-4" />
              Bypass Auth (Dev Login)
            </a>
          </div>
          
          <p className="text-center text-xs text-muted-foreground font-mono mt-8">
            Access requires a valid engineering profile.
          </p>
        </div>
      </div>
    </div>
  )
}
