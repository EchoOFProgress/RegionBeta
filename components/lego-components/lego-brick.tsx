"use client"

import { memo } from "react"
import type { Category } from "@/lib/types"
import { CATEGORIES } from "@/lib/constants"
import { cn } from "@/lib/utils"

interface LegoBrickProps {
  category: Category
  day: number
  hour: number
  timeSlot: string
  dayName: string
  onClick: () => void
  isSelected?: boolean
}

export const LegoBrick = memo(function LegoBrick({
  category,
  day,
  hour,
  timeSlot,
  dayName,
  onClick,
  isSelected,
}: LegoBrickProps) {
  const categoryInfo = CATEGORIES[category]

  return (
    <button
      onClick={onClick}
      className={cn(
        "lego-brick w-full aspect-square flex items-center justify-center text-lg sm:text-xl",
        "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
        "relative group",
        categoryInfo.color,
        isSelected && "ring-2 ring-primary ring-offset-2",
      )}
      title={`${dayName} ${timeSlot} | ${categoryInfo.emoji} ${categoryInfo.name} (2h)`}
      aria-label={`${dayName} ${timeSlot}: ${categoryInfo.name}. Klikni pro změnu.`}
    >
      <span className="sr-only">{categoryInfo.name}</span>

      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-foreground text-background text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
        {dayName} {timeSlot}
        <br />
        {categoryInfo.emoji} {categoryInfo.name}
      </div>
    </button>
  )
})
