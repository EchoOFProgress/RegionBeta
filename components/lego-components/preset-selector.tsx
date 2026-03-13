"use client"

import type { WeekStats } from "@/lib/types"
import { cn } from "@/lib/utils"

interface PresetSelectorProps {
  stats: WeekStats
}

const PRESETS = [
  {
    id: "default",
    name: "Default Week",
    subtitle: "Zombie Mode 🧟",
    description: "0h startup • 36h free time",
    color: "bg-red-500/10 border-red-500/30",
    activeColor: "bg-red-500 text-white",
    condition: (stats: WeekStats) => stats.startup === 0 && stats.freetime >= 30,
  },
  {
    id: "hustle",
    name: "Hustle Mode",
    subtitle: "Before Quit 🔥",
    description: "20h startup • 16h free time",
    color: "bg-orange-500/10 border-orange-500/30",
    activeColor: "bg-orange-500 text-white",
    condition: (stats: WeekStats) => stats.startup >= 15 && stats.startup <= 25 && stats.freetime >= 10 && stats.freetime <= 20,
  },
  {
    id: "freedom",
    name: "Full Freedom",
    subtitle: "After Quit 🎯",
    description: "80h startup • 0h work",
    color: "bg-yellow-500/10 border-yellow-500/30",
    activeColor: "bg-yellow-500 text-foreground",
    condition: (stats: WeekStats) => stats.startup >= 70 && stats.work === 0,
  },
]

export function PresetSelector({ stats }: PresetSelectorProps) {
  return (
    <div className="space-y-3">
      <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wide">📋 Preset Scenarios</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {PRESETS.map((preset) => {
          const isActive = preset.condition(stats)
          
          return (
            <div
              key={preset.id}
              className={cn(
                "h-auto py-3 px-4 flex flex-col items-start gap-1 transition-all border rounded-md",
                isActive ? preset.activeColor : preset.color,
              )}
            >
              <span className="font-bold text-sm">{preset.name}</span>
              <span className="text-xs opacity-80">{preset.subtitle}</span>
              <span className="text-[10px] opacity-60">{preset.description}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}