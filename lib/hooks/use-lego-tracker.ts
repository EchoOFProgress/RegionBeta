"use client"

import { useState, useCallback, useEffect, useMemo, useRef } from "react"
import type { BrickData, Category, WeekStats, Achievement, PresetType } from "../types"
import { DEFAULT_PRESET, HUSTLE_PRESET, FREEDOM_PRESET, ACHIEVEMENTS, CATEGORY_ORDER } from "../constants"

const STORAGE_KEY = "lego-time-tracker"

export function useLegoTracker() {
  const [bricks, setBricks] = useState<BrickData[]>(DEFAULT_PRESET)
  const [achievements, setAchievements] = useState<Achievement[]>(ACHIEVEMENTS)
  const [newAchievement, setNewAchievement] = useState<Achievement | null>(null)
  const [currentPreset, setCurrentPreset] = useState<PresetType>("default")
  const hasLoadedRef = useRef(false)

  // Load from localStorage on mount
  useEffect(() => {
    if (hasLoadedRef.current) return
    hasLoadedRef.current = true

    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const data = JSON.parse(saved)
        if (data.bricks) setBricks(data.bricks)
        if (data.achievements) {
          const savedUnlocked = new Set(
            data.achievements.filter((a: Achievement) => a.unlocked).map((a: Achievement) => a.id),
          )
          setAchievements(
            ACHIEVEMENTS.map((a) => ({
              ...a,
              unlocked: savedUnlocked.has(a.id),
            })),
          )
        }
        if (data.currentPreset) setCurrentPreset(data.currentPreset)
      } catch {
        // Invalid data, use defaults
      }
    }
  }, [])

  useEffect(() => {
    if (!hasLoadedRef.current) return
    const data = {
      bricks,
      achievements: achievements.map(({ id, unlocked }) => ({ id, unlocked })),
      currentPreset,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }, [bricks, achievements, currentPreset])

  const stats: WeekStats = useMemo(() => {
    return bricks.reduce(
      (acc, brick) => {
        acc[brick.category] += 2 // Each brick = 2 hours
        return acc
      },
      { sleep: 0, work: 0, essentials: 0, freetime: 0, startup: 0, total: 168 },
    )
  }, [bricks])

  // Toggle brick category
  const toggleBrick = useCallback((day: number, hour: number) => {
    setBricks((prev) => {
      const newBricks = [...prev]
      const index = day * 12 + hour
      const brick = newBricks[index]
      const currentIndex = CATEGORY_ORDER.indexOf(brick.category)
      const nextCategory = CATEGORY_ORDER[(currentIndex + 1) % CATEGORY_ORDER.length]
      newBricks[index] = { ...brick, category: nextCategory }
      return newBricks
    })
  }, [])

  // Set specific brick category
  const setBrickCategory = useCallback((day: number, hour: number, category: Category) => {
    setBricks((prev) => {
      const newBricks = [...prev]
      const index = day * 12 + hour
      newBricks[index] = { ...newBricks[index], category }
      return newBricks
    })
  }, [])

  // Load preset
  const loadPreset = useCallback((preset: PresetType) => {
    setCurrentPreset(preset)
    switch (preset) {
      case "default":
        setBricks(DEFAULT_PRESET.map((b) => ({ ...b })))
        break
      case "hustle":
        setBricks(HUSTLE_PRESET.map((b) => ({ ...b })))
        break
      case "freedom":
        setBricks(FREEDOM_PRESET.map((b) => ({ ...b })))
        break
    }
  }, [])

  useEffect(() => {
    setAchievements((prevAchievements) => {
      let hasChanges = false
      let unlockedAchievement: Achievement | null = null

      const updatedAchievements = prevAchievements.map((achievement) => {
        if (achievement.unlocked) return achievement

        let shouldUnlock = false

        // Special checks for time-based achievements
        if (achievement.id === "early_bird") {
          shouldUnlock = bricks.some((b) => b.hour === 3 && b.category === "startup")
        } else if (achievement.id === "night_owl") {
          shouldUnlock = bricks.some((b) => b.hour === 11 && b.category === "startup")
        } else if (achievement.id === "weekend_warrior") {
          const weekendStartup = bricks.filter((b) => b.day >= 5 && b.category === "startup").length * 2
          shouldUnlock = weekendStartup >= 10
        } else if (achievement.id === "no_netflix_day") {
          for (let day = 0; day < 7; day++) {
            const dayFreetime = bricks.filter((b) => b.day === day && b.category === "freetime").length
            if (dayFreetime === 0) {
              shouldUnlock = true
              break
            }
          }
        } else {
          shouldUnlock = achievement.condition(stats)
        }

        if (shouldUnlock) {
          hasChanges = true
          unlockedAchievement = { ...achievement, unlocked: true }
          return unlockedAchievement
        }

        return achievement
      })

      if (hasChanges && unlockedAchievement) {
        // Use setTimeout to avoid state update during render
        setTimeout(() => setNewAchievement(unlockedAchievement), 0)
        return updatedAchievements
      }

      return prevAchievements
    })
  }, [bricks, stats])

  const clearNewAchievement = useCallback(() => {
    setNewAchievement(null)
  }, [])

  // Get startup level for quotes
  const getStartupLevel = useCallback((): "low" | "medium" | "high" | "legendary" => {
    if (stats.startup >= 40) return "legendary"
    if (stats.startup >= 25) return "high"
    if (stats.startup >= 10) return "medium"
    return "low"
  }, [stats.startup])

  // Calculate weeks until freedom (based on 720h total needed)
  const weeksUntilFreedom = useCallback(() => {
    if (stats.startup === 0) return Number.POSITIVE_INFINITY
    const hoursNeeded = 720 // ~9 months worth at 20h/week
    return Math.ceil(hoursNeeded / stats.startup)
  }, [stats.startup])

  return {
    bricks,
    stats,
    achievements,
    newAchievement,
    currentPreset,
    toggleBrick,
    setBrickCategory,
    loadPreset,
    clearNewAchievement,
    getStartupLevel,
    weeksUntilFreedom,
  }
}
