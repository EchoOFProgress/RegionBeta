"use client"

import { useEffect } from "react"
import { LegoGrid } from "@/components/lego-components/lego-grid"
import { StatsDashboard } from "@/components/lego-components/stats-dashboard"
import { PresetSelector } from "@/components/lego-components/preset-selector"
import { CategoryLegend } from "@/components/lego-components/category-legend"
import { QuoteDisplay } from "@/components/lego-components/quote-display"
import { AchievementsPanel } from "@/components/lego-components/achievements-panel"
import { AchievementPopup } from "@/components/lego-components/achievement-popup"
import { useLegoTracker } from "@/lib/hooks/use-lego-tracker"

export function LegoTimeTracker() {
  const {
    bricks,
    stats,
    achievements,
    newAchievement,
    currentPreset,
    toggleBrick,
    loadPreset,
    clearNewAchievement,
    getStartupLevel,
    weeksUntilFreedom,
  } = useLegoTracker()

  // Enforce dark mode
  useEffect(() => {
    document.documentElement.classList.add("dark")
    document.documentElement.style.setProperty("color-scheme", "dark")
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 container px-4 py-6 sm:py-8">
        {/* Hero Section */}
        <section className="text-center mb-8">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight mb-3 text-balance">
            Visualize Your{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
              168 Hours
            </span>
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto text-pretty">
            Tvůj týden ve formě LEGO kostek. Klikni pro změnu kategorie. Najdi čas pro svůj startup. Dosáhni svobody.
          </p>
        </section>

        {/* Quote */}
        <section className="mb-8">
          <QuoteDisplay level={getStartupLevel()} />
        </section>

        {/* Legend */}
        <section className="mb-6">
          <CategoryLegend />
        </section>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          {/* LEGO Grid */}
          <div className="lg:col-span-2 space-y-6">
            {/* Preset Selector */}
            <PresetSelector stats={stats} />

            {/* Grid */}
            <div className="bg-card rounded-xl p-4 sm:p-6 border shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg">🧱 Tvůj Týden</h3>
                <span className="text-xs text-muted-foreground">Klikni na kostku pro změnu</span>
              </div>
              <LegoGrid bricks={bricks} onToggleBrick={toggleBrick} />
            </div>

            {/* Achievements */}
            <AchievementsPanel achievements={achievements} />
          </div>

          {/* Stats Sidebar */}
          <div className="lg:col-span-1">
            <StatsDashboard stats={stats} weeksUntilFreedom={weeksUntilFreedom()} />
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-sm text-muted-foreground">
          <p className="mb-2">
            Inspirováno <span className="font-medium text-foreground">Monish Pabrai's Dando Framework</span>
          </p>
          <p className="text-xs">"Yellow is more exciting than orange!" 🟨 &gt; 🟧</p>
        </footer>
      </main>

      {/* Achievement Popup */}
      <AchievementPopup achievement={newAchievement} onClose={clearNewAchievement} />
    </div>
  )
}