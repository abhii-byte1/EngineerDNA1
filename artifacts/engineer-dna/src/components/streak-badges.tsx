import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Trophy, Sparkles, Globe, Zap, Award } from "lucide-react";

interface MilestoneBadgeProps {
  githubReport?: {
    overallScore?: number | null;
    isPublic?: boolean;
    leaderboardOptIn?: boolean;
    archetype?: string | null;
  } | null;
}

export function MilestoneBadges({ githubReport }: MilestoneBadgeProps) {
  if (!githubReport) return null;

  const milestones = [
    {
      title: "First Scan",
      unlocked: true,
      icon: <Award className="w-3.5 h-3.5 text-blue-400" />,
    },
    {
      title: "Archetype Unlocked",
      unlocked: !!githubReport.archetype,
      icon: <Sparkles className="w-3.5 h-3.5 text-purple-400" />,
    },
    {
      title: "Public Pioneer",
      unlocked: !!githubReport.isPublic,
      icon: <Globe className="w-3.5 h-3.5 text-emerald-400" />,
    },
    {
      title: "Leaderboard Contender",
      unlocked: !!githubReport.leaderboardOptIn,
      icon: <Trophy className="w-3.5 h-3.5 text-amber-400" />,
    },
    {
      title: "High Velocity (80+)",
      unlocked: (githubReport.overallScore ?? 0) >= 80,
      icon: <Zap className="w-3.5 h-3.5 text-yellow-400" />,
    },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {milestones.map((m) => (
        <Badge
          key={m.title}
          variant="outline"
          className={`flex items-center gap-1.5 px-3 py-1 text-xs font-mono transition-all ${
            m.unlocked
              ? "bg-primary/10 border-primary/30 text-foreground"
              : "opacity-40 border-dashed border-border"
          }`}
        >
          {m.icon}
          <span>{m.title}</span>
        </Badge>
      ))}
    </div>
  );
}
