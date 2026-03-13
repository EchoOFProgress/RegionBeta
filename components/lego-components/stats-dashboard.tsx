"use client"

import type { WeekStats, Category } from "@/lib/types"
import { CATEGORIES } from "@/lib/constants"
import { cn } from "@/lib/utils"

interface StatsDashboardProps {
  stats: WeekStats
  weeksUntilFreedom: number
}

export function StatsDashboard({ stats, weeksUntilFreedom }: StatsDashboardProps) {
  const categories: Category[] = ["sleep", "work", "essentials", "freetime", "startup"]

  // Calculate sacrifice ratio (how much of original free time went to startup)
  const originalFreeTime = 36 // Default free time hours in Zombie Mode
  const currentFreeTime = stats.freetime
  const sacrificedFreeTime = originalFreeTime - currentFreeTime
  const sacrificeRatio = Math.min(100, Math.max(0, Math.round((sacrificedFreeTime / originalFreeTime) * 100)))

  // Get startup intensity level
  const getIntensityColor = () => {
    if (stats.startup >= 40) return "text-yellow-400 dark:text-yellow-300"
    if (stats.startup >= 30) return "text-green-500"
    if (stats.startup >= 20) return "text-yellow-500"
    if (stats.startup >= 10) return "text-orange-500"
    return "text-red-500"
  }

  const getGrade = () => {
    if (stats.startup >= 60) return { grade: "SSS", label: "LEGENDARY" }
    if (stats.startup >= 50) return { grade: "SS", label: "ELITE" }
    if (stats.startup >= 40) return { grade: "S", label: "BEAST" }
    if (stats.startup >= 30) return { grade: "A", label: "SERIOUS" }
    if (stats.startup >= 20) return { grade: "B", label: "COMMITTED" }
    if (stats.startup >= 10) return { grade: "C", label: "STARTING" }
    if (stats.startup >= 2) return { grade: "D", label: "BEGINNER" }
    return { grade: "F", label: "ZOMBIE" }
  }

  const { grade, label } = getGrade()

  return (
    <div className="space-y-6">
      {/* Main Stats Card */}
      <div className="bg-card rounded-xl p-4 sm:p-6 border shadow-sm">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">📊 Tvůj týden v číslech</h3>

        <div className="space-y-3">
          {categories.map((cat) => {
            const info = CATEGORIES[cat]
            const hours = stats[cat]
            const percentage = Math.round((hours / 168) * 100)

            return (
              <div key={cat} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span>{info.emoji}</span>
                    <span className="font-medium">{info.name}</span>
                  </span>
                  <span className="font-mono text-muted-foreground">
                    {hours}h ({percentage}%)
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all duration-500", info.color)}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-4 pt-4 border-t text-center">
          <span className="text-sm text-muted-foreground">CELKEM: </span>
          <span className="font-bold font-mono">168h</span>
        </div>
      </div>

      {/* Startup Hours Highlight */}
      <div className="bg-card rounded-xl p-4 sm:p-6 border shadow-sm text-center">
        <h3 className="text-sm font-medium text-muted-foreground mb-2">🚀 STARTUP HOURS / WEEK</h3>
        <div className={cn("text-5xl sm:text-6xl font-black", getIntensityColor())}>{stats.startup}h</div>
        <div className="mt-2">
          <span
            className={cn(
              "inline-block px-3 py-1 rounded-full text-sm font-bold",
              stats.startup >= 20
                ? "bg-yellow-400/20 text-yellow-600 dark:text-yellow-400"
                : "bg-muted text-muted-foreground",
            )}
          >
            Grade: {grade} • {label}
          </span>
        </div>
      </div>

      {/* Sacrifice Ratio */}
      <div className="bg-card rounded-xl p-4 sm:p-6 border shadow-sm">
        <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
          🔥 Free Time Sacrifice Ratio
        </h3>
        <div className="relative h-4 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-orange-500 to-yellow-400 rounded-full transition-all duration-500"
            style={{ width: `${sacrificeRatio}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-sm">
          <span className="text-muted-foreground">0%</span>
          <span className="font-bold">{sacrificeRatio}%</span>
          <span className="text-muted-foreground">100%</span>
        </div>
        {sacrificeRatio >= 100 && (
          <p className="text-xs text-center mt-2 text-yellow-600 dark:text-yellow-400">
            💀 Zero fucks given about Netflix!
          </p>
        )}
      </div>

      {/* Weeks Until Freedom */}
      <div className="bg-card rounded-xl p-4 sm:p-6 border shadow-sm">
        <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
          ⏰ Countdown to Freedom
        </h3>
        {stats.startup === 0 ? (
          <p className="text-center text-muted-foreground text-sm">Přidej startup hodiny pro výpočet! 🚀</p>
        ) : (
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Při {stats.startup}h/týden:</span>
              <span className="font-bold font-mono">
                {weeksUntilFreedom === Number.POSITIVE_INFINITY ? "∞" : `${weeksUntilFreedom} týdnů`}
              </span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>
                = {weeksUntilFreedom === Number.POSITIVE_INFINITY ? "?" : Math.ceil(weeksUntilFreedom / 4)} měsíců
              </span>
              <span className="text-xs">{weeksUntilFreedom <= 36 ? "🎯 Dosažitelné!" : "⚡ Přidej více!"}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
