"use client"

import { CATEGORIES, CATEGORY_ORDER } from "@/lib/constants"
import { cn } from "@/lib/utils"

export function CategoryLegend() {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {CATEGORY_ORDER.map((cat) => {
        const info = CATEGORIES[cat]
        return (
          <div
            key={cat}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm",
              info.color,
              "text-white dark:text-white",
            )}
          >
            <span>{info.emoji}</span>
            <span className="font-medium">{info.name}</span>
          </div>
        )
      })}
    </div>
  )
}
