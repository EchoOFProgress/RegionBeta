"use client"

import { useEffect, useState } from "react"
import type { Achievement } from "@/lib/types"
import { cn } from "@/lib/utils"

interface AchievementPopupProps {
  achievement: Achievement | null
  onClose: () => void
}

export function AchievementPopup({ achievement, onClose }: AchievementPopupProps) {
  const [confetti, setConfetti] = useState<Array<{ id: number; x: number; color: string; delay: number }>>([])

  useEffect(() => {
    if (achievement) {
      // Generate confetti
      const newConfetti = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        color: ["#FBBF24", "#F97316", "#3B82F6", "#A855F7", "#10B981"][Math.floor(Math.random() * 5)],
        delay: Math.random() * 0.5,
      }))
      setConfetti(newConfetti)

      // Auto close after 4 seconds
      const timer = setTimeout(onClose, 4000)
      return () => clearTimeout(timer)
    }
  }, [achievement, onClose])

  if (!achievement) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      {/* Confetti */}
      {confetti.map((c) => (
        <div
          key={c.id}
          className="confetti absolute w-3 h-3 rounded-sm"
          style={{
            left: `${c.x}%`,
            top: "-20px",
            backgroundColor: c.color,
            animationDelay: `${c.delay}s`,
          }}
        />
      ))}

      {/* Achievement Card */}
      <div
        className={cn(
          "bg-card rounded-2xl p-8 shadow-2xl text-center max-w-sm mx-4",
          "animate-in zoom-in-95 duration-300",
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-6xl mb-4 animate-bounce">{achievement.emoji}</div>
        <h2 className="text-2xl font-black mb-2">Achievement Unlocked!</h2>
        <h3 className="text-xl font-bold text-primary mb-2">{achievement.name}</h3>
        <p className="text-muted-foreground">{achievement.description}</p>
        <button
          onClick={onClose}
          className="mt-6 px-6 py-2 bg-primary text-primary-foreground rounded-full font-bold hover:opacity-90 transition-opacity"
        >
          Nice! 🎉
        </button>
      </div>
    </div>
  )
}
