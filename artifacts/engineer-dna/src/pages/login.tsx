import * as React from "react"
import { Link } from "wouter"
import { motion, AnimatePresence } from "framer-motion"
import {
  Github, Code2, Terminal, Shield, Eye, Lock,
  CheckCircle2, XCircle, Star, GitBranch, Zap, ChevronDown
} from "lucide-react"

// What we request vs what we DON'T do — transparency breakdown
const PERMISSIONS = [
  {
    icon: <Eye className="w-4 h-4 text-emerald-400" />,
    allowed: true,
    label: "Read your public GitHub profile",
    detail: "Name, avatar, bio — only what's already public",
  },
  {
    icon: <Eye className="w-4 h-4 text-emerald-400" />,
    allowed: true,
    label: "Read your public repositories",
    detail: "Repo names, languages, topics — to analyze your stack",
  },
  {
    icon: <Eye className="w-4 h-4 text-emerald-400" />,
    allowed: true,
    label: "Read your email address",
    detail: "Only to identify your account — never shared",
  },
  {
    icon: <XCircle className="w-4 h-4 text-red-400" />,
    allowed: false,
    label: "Write to your repositories",
    detail: "We cannot push, delete or modify any code",
  },
  {
    icon: <XCircle className="w-4 h-4 text-red-400" />,
    allowed: false,
    label: "Access private repositories",
    detail: "We only ever see what's publicly visible",
  },
  {
    icon: <XCircle className="w-4 h-4 text-red-400" />,
    allowed: false,
    label: "Access your GitHub tokens or secrets",
    detail: "Impossible — OAuth scope does not permit this",
  },
]

const TRUST_BADGES = [
  { icon: <Lock className="w-4 h-4" />, label: "Read-only OAuth" },
  { icon: <Shield className="w-4 h-4" />, label: "No code access" },
  { icon: <XCircle className="w-4 h-4" />, label: "Never sold" },
]

export default function Login() {
  const [showPermissions, setShowPermissions] = React.useState(false)

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">

      {/* ── Left panel — Brand & features ── */}
      <div className="hidden md:flex flex-1 bg-card/50 border-r border-border relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10 max-w-lg">
          {/* Logo */}
          <div className="flex items-center gap-3 font-mono font-bold text-2xl tracking-tighter mb-10">
            <div className="w-9 h-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
              DNA
            </div>
            EngineerDNA
          </div>

          <h1 className="text-4xl font-bold tracking-tight mb-4 leading-tight">
            Your engineering growth,<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
              finally measured.
            </span>
          </h1>
          <p className="text-muted-foreground text-lg mb-10 leading-relaxed">
            AI analysis of your GitHub and resume — so you know exactly where you're strong, where you're weak, and what to build next.
          </p>

          {/* Feature list */}
          <div className="space-y-3">
            {[
              { icon: <Github className="w-4 h-4 text-primary" />, text: "Deep GitHub repository analysis" },
              { icon: <Star className="w-4 h-4 text-secondary" />, text: "Shareable public scorecard" },
              { icon: <Zap className="w-4 h-4 text-amber-400" />, text: "Personalized growth roadmap" },
              { icon: <GitBranch className="w-4 h-4 text-emerald-400" />, text: "See your rank on the leaderboard" },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="w-7 h-7 rounded-md bg-background border border-border flex items-center justify-center flex-shrink-0">
                  {icon}
                </div>
                {text}
              </div>
            ))}
          </div>

          {/* Social proof */}
          <div className="mt-10 flex items-center gap-2 text-xs text-muted-foreground font-mono">
            <div className="flex -space-x-1">
              {["bg-primary", "bg-secondary", "bg-amber-500", "bg-emerald-500"].map((c, i) => (
                <div key={i} className={`w-6 h-6 rounded-full ${c} border-2 border-card`} />
              ))}
            </div>
            <span>Trusted by engineers who take growth seriously</span>
          </div>
        </div>
      </div>

      {/* ── Right panel — Auth + Trust ── */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 relative">

        {/* Mobile logo */}
        <Link href="/" className="absolute top-6 left-6 md:hidden flex items-center gap-2 font-mono font-bold tracking-tighter">
          <div className="w-6 h-6 rounded bg-primary text-primary-foreground flex items-center justify-center text-xs">DNA</div>
          EngineerDNA
        </Link>

        <div className="w-full max-w-md space-y-6">

          {/* Header */}
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold tracking-tight">Sign in to get started</h2>
            <p className="text-muted-foreground text-sm">
              We use GitHub to verify you're a real engineer — nothing more.
            </p>
          </div>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-3 flex-wrap">
            {TRUST_BADGES.map(({ icon, label }) => (
              <div key={label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
                {icon}
                {label}
              </div>
            ))}
          </div>

          {/* Sign in button */}
          <a
            href="/api/auth/github"
            target="_top"
            id="github-login-btn"
            className="flex items-center justify-center w-full gap-3 bg-foreground text-background hover:bg-foreground/90 h-13 py-3.5 rounded-xl font-semibold text-base transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-foreground/10"
          >
            <Github className="w-5 h-5" />
            Continue with GitHub
          </a>

          {/* Scope accordion */}
          <div className="rounded-xl border border-border overflow-hidden">
            <button
              id="toggle-permissions-btn"
              onClick={() => setShowPermissions(v => !v)}
              className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium hover:bg-muted/50 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                What we ask from GitHub
              </span>
              <motion.div animate={{ rotate: showPermissions ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </motion.div>
            </button>

            <AnimatePresence>
              {showPermissions && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="border-t border-border divide-y divide-border">
                    {PERMISSIONS.map(({ icon, allowed, label, detail }) => (
                      <div key={label} className="flex items-start gap-3 px-4 py-3">
                        <div className="mt-0.5 flex-shrink-0">{icon}</div>
                        <div>
                          <p className={`text-sm font-medium ${allowed ? "text-foreground" : "text-muted-foreground line-through"}`}>
                            {label}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">{detail}</p>
                        </div>
                        <div className="ml-auto flex-shrink-0 mt-0.5">
                          {allowed
                            ? <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            : <XCircle className="w-4 h-4 text-red-400/60" />
                          }
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* OAuth scope note */}
                  <div className="px-4 py-3 bg-muted/30 border-t border-border">
                    <p className="text-xs text-muted-foreground font-mono">
                      OAuth scopes requested: <span className="text-primary">read:user user:email</span>
                      <br />
                      Read-only. GitHub enforces this — we have no ability to write.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Data promise */}
          <div className="rounded-xl bg-primary/5 border border-primary/15 px-4 py-3 space-y-2">
            <p className="text-xs font-semibold text-primary uppercase tracking-wider">Our data promise</p>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                Your data is used only to generate your personal analysis — never sold or shared with third parties.
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                You can delete your account and all data anytime from Settings.
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                We never access private repositories or write to your GitHub.
              </li>
            </ul>
          </div>

          {/* Dev login — dev only */}
          {import.meta.env.DEV && (
            <>
              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase font-mono">
                  <span className="bg-background px-2 text-muted-foreground/50">Development Only</span>
                </div>
              </div>
              <a
                href="/api/auth/dev-login"
                className="flex items-center justify-center w-full gap-3 border border-border bg-card hover:bg-muted h-11 rounded-lg font-medium text-sm text-muted-foreground transition-colors"
              >
                <Terminal className="w-4 h-4" />
                Bypass Auth (Dev Login)
              </a>
            </>
          )}

          <p className="text-center text-xs text-muted-foreground/60 font-mono">
            By continuing, you agree our data is used only for your personal analysis.
          </p>
        </div>
      </div>
    </div>
  )
}
