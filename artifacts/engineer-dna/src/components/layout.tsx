import * as React from "react"
import { Link, useLocation } from "wouter"
import { useGetMe, useLogout } from "@workspace/api-client-react"
import { 
  LayoutDashboard, 
  Github, 
  Flame, 
  Trophy, 
  Map, 
  Target, 
  BrainCircuit, 
  Settings,
  LogOut,
  Info,
  MessageSquare
} from "lucide-react"
import { cn } from "@/lib/utils"
import { GlobalFeedbackModal } from "@/components/feedback-widget"

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/github-dna", label: "GitHub DNA", icon: Github },
  { href: "/roast", label: "Roast", icon: Flame },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/roadmap", label: "Roadmap", icon: Map },
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/interview-simulator", label: "Interview Simulator", icon: BrainCircuit },
  { href: "/about", label: "About", icon: Info },
]

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation()
  const { data: me } = useGetMe()
  const logout = useLogout()
  const [feedbackOpen, setFeedbackOpen] = React.useState(false)

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        setLocation("/")
      }
    })
  }

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row relative">
      <GlobalFeedbackModal open={feedbackOpen} onOpenChange={setFeedbackOpen} />

      {/* Sidebar */}
      <aside className="w-full md:w-64 border-r border-border bg-card/30 backdrop-blur-xl flex flex-col shrink-0 sticky top-0 md:h-screen z-10">
        <div className="p-6 border-b border-border flex items-center justify-between md:justify-start">
          <Link href="/dashboard" className="flex items-center gap-3 font-mono font-bold text-lg tracking-tighter hover:text-primary transition-colors">
            <div className="w-6 h-6 rounded bg-primary text-primary-foreground flex items-center justify-center text-xs">
              DNA
            </div>
            EngineerDNA
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1 flex md:flex-col overflow-x-auto md:overflow-x-visible">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive = location.startsWith(item.href)
            
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all shrink-0 md:shrink",
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-border mt-auto hidden md:block">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            {me?.avatarUrl ? (
              <img src={me.avatarUrl} alt={me.name} className="w-8 h-8 rounded-full bg-muted object-cover" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center font-mono text-xs text-muted-foreground">
                {me?.name?.charAt(0) || "U"}
              </div>
            )}
            <div className="flex flex-col truncate">
              <span className="text-sm font-medium truncate">{me?.name}</span>
              <span className="text-xs text-muted-foreground truncate">{me?.email || me?.githubUsername}</span>
            </div>
          </div>
          
          <button
            onClick={() => setFeedbackOpen(true)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-amber-400 hover:bg-amber-400/10 transition-all mb-1"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Give Feedback</span>
          </button>

          <Link 
            href="/settings"
            className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </Link>
          
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 mt-1 rounded-md text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Log out</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0 h-[calc(100vh-80px)] md:h-screen overflow-y-auto relative">
        <div className="container max-w-6xl mx-auto p-4 md:p-8">
          {children}
        </div>

        {/* Floating Feedback Trigger */}
        <button
          onClick={() => setFeedbackOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-2.5 rounded-full bg-primary text-primary-foreground font-mono text-xs font-bold shadow-2xl hover:scale-105 transition-all"
        >
          <MessageSquare className="w-4 h-4" />
          Feedback
        </button>
      </main>
    </div>
  )
}
