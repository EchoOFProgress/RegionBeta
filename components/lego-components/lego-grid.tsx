"use client"

import { LegoBrick } from "./lego-brick"
import type { BrickData } from "@/lib/types"
import { DAYS, DAYS_FULL, TIME_SLOTS } from "@/lib/constants"

interface LegoGridProps {
  bricks: BrickData[]
  onToggleBrick: (day: number, hour: number) => void
}

export function LegoGrid({ bricks, onToggleBrick }: LegoGridProps) {
  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[400px]">
        {/* Header row with days */}
        <div className="grid grid-cols-8 gap-1 mb-2">
          <div className="text-xs font-medium text-muted-foreground text-center py-1">Čas</div>
          {DAYS.map((day, i) => (
            <div key={day} className="text-xs sm:text-sm font-bold text-center py-1" title={DAYS_FULL[i]}>
              {day}
            </div>
          ))}
        </div>

        {/* Grid rows */}
        {TIME_SLOTS.map((slot, hourIndex) => (
          <div key={slot} className="grid grid-cols-8 gap-1 mb-1">
            {/* Time label */}
            <div className="text-[10px] sm:text-xs font-mono text-muted-foreground flex items-center justify-center">
              {slot}
            </div>

            {/* Bricks for each day */}
            {DAYS.map((_, dayIndex) => {
              const brick = bricks.find((b) => b.day === dayIndex && b.hour === hourIndex)
              return (
                <LegoBrick
                  key={`${dayIndex}-${hourIndex}`}
                  category={brick?.category || "freetime"}
                  day={dayIndex}
                  hour={hourIndex}
                  timeSlot={slot}
                  dayName={DAYS_FULL[dayIndex]}
                  onClick={() => onToggleBrick(dayIndex, hourIndex)}
                />
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
