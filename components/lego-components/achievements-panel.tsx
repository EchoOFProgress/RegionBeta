"use client"

import type { Achievement } from "@/lib/types"
import { cn } from "@/lib/utils"

interface AchievementsPanelProps {
  achievements: Achievement[]
}

const TIER_COLORS = {
  beginner: "bg-amber-600/20 border-amber-600/40",
  intermediate: "bg-slate-400/20 border-slate-400/40",
  advanced: "bg-yellow-500/20 border-yellow-500/40",
  legendary: "bg-purple-500/20 border-purple-500/40",
}

export function AchievementsPanel({ achievements }: AchievementsPanelProps) {
  const unlockedCount = achievements.filter((a) => a.unlocked).length

  return (
    <div className="bg-card rounded-xl p-4 sm:p-6 border shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg flex items-center gap-2">🏆 Achievements</h3>
        <span className="text-sm text-muted-foreground font-mono">
          {unlockedCount}/{achievements.length}
        </span>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
        {achievements.map((achievement) => (
          <div
            key={achievement.id}
            className={cn(
              "relative aspect-square rounded-lg border-2 flex flex-col items-center justify-center p-2 transition-all",
              achievement.unlocked ? TIER_COLORS[achievement.tier] : "bg-muted/50 border-muted opacity-50 grayscale",
            )}
            title={`${achievement.name}: ${achievement.description}`}
          >
            <span className="text-2xl">{achievement.emoji}</span>
            <span className="text-[9px] font-medium text-center mt-1 leading-tight">{achievement.name}</span>
            {achievement.unlocked && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-[10px] text-white">✓</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
