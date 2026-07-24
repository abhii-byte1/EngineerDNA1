import * as React from "react";
import { Link } from "wouter";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border px-6 py-4 flex items-center justify-between bg-card/40 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3 font-mono font-bold text-lg tracking-tighter">
          <div className="w-6 h-6 rounded bg-primary text-primary-foreground flex items-center justify-center text-xs">
            DNA
          </div>
          <span>EngineerDNA — Admin</span>
        </div>
        <Link href="/dashboard" className="text-sm font-mono text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
          ← Back to app
        </Link>
      </header>
      <main className="p-6 max-w-7xl mx-auto">{children}</main>
    </div>
  );
}
