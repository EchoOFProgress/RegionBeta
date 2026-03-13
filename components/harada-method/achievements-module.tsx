"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { getStats, getAchievements } from "./storage"
import type { UserStats, Achievement } from "./types"
import { cn } from "@/lib/utils"
import { Trophy, Lock, Star, Flame, CheckCircle, Target } from "lucide-react"

interface AchievementsModuleProps {
  userId: string
}

export function AchievementsModule({ userId }: AchievementsModuleProps) {
  const [stats, setStats] = useState<UserStats>({
    totalDays: 0,
    currentStreak: 0,
    longestStreak: 0,
    tasksCompleted: 0,
    diaryEntries: 0,
    assessmentsCompleted: 0,
    goalsAchieved: 0,
    points: 0,
    level: 1,
  })
  const [achievements, setAchievements] = useState<Achievement[]>([])

  useEffect(() => {
    setStats(getStats())
    setAchievements(getAchievements())
  }, [userId])

  const unlockedCount = achievements.filter((a) => a.unlockedAt).length
  const totalCount = achievements.length

  const levelProgress = stats.points % 100
  const pointsToNextLevel = 100 - levelProgress

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "streak":
        return "bg-orange-100 text-orange-700 border-orange-200"
      case "completion":
        return "bg-green-100 text-green-700 border-green-200"
      case "milestone":
        return "bg-blue-100 text-blue-700 border-blue-200"
      case "special":
        return "bg-purple-100 text-purple-700 border-purple-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "streak":
        return "Série"
      case "completion":
        return "Dokončení"
      case "milestone":
        return "Milník"
      case "special":
        return "Speciální"
      default:
        return category
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Úspěchy a odměny</h2>
        <p className="text-muted-foreground">Sledujte svůj pokrok a odemykejte achievementy</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              Úroveň
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-center">
                <p className="text-4xl font-bold text-primary">{stats.level}</p>
                <p className="text-sm text-muted-foreground">{stats.points} bodů celkem</p>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Pokrok k další úrovni</span>
                  <span>{levelProgress}/100</span>
                </div>
                <Progress value={levelProgress} className="h-2" />
              </div>
              <p className="text-xs text-center text-muted-foreground">
                {pointsToNextLevel} bodů do úrovně {stats.level + 1}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              Achievementy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-center">
                <p className="text-4xl font-bold">
                  {unlockedCount}
                  <span className="text-xl text-muted-foreground">/{totalCount}</span>
                </p>
                <p className="text-sm text-muted-foreground">odemčeno</p>
              </div>
              <Progress value={(unlockedCount / totalCount) * 100} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" />
              Série
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-3xl font-bold text-orange-500">{stats.currentStreak}</p>
                <p className="text-xs text-muted-foreground">Aktuální</p>
              </div>
              <div>
                <p className="text-3xl font-bold">{stats.longestStreak}</p>
                <p className="text-xs text-muted-foreground">Nejdelší</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Statistiky</CardTitle>
          <CardDescription>Váš celkový pokrok v aplikaci</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-blue-100 flex items-center justify-center">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-2xl font-bold">{stats.assessmentsCompleted}</p>
              <p className="text-sm text-muted-foreground">Sebehodnocení</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-2xl font-bold">{stats.tasksCompleted}</p>
              <p className="text-sm text-muted-foreground">Splněné úkoly</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-purple-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <p className="text-2xl font-bold">{stats.diaryEntries}</p>
              <p className="text-sm text-muted-foreground">Deníkové záznamy</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-orange-100 flex items-center justify-center">
                <Flame className="w-6 h-6 text-orange-600" />
              </div>
              <p className="text-2xl font-bold">{stats.totalDays}</p>
              <p className="text-sm text-muted-foreground">Aktivních dní</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-xl font-bold mb-4">Všechny achievementy</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((achievement) => {
            const isUnlocked = !!achievement.unlockedAt
            const progressPercent = Math.min((achievement.progress / achievement.requirement) * 100, 100)

            return (
              <Card
                key={achievement.id}
                className={cn("transition-all", isUnlocked ? "border-primary/50 bg-primary/5" : "opacity-75")}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div
                      className={cn(
                        "w-14 h-14 rounded-xl flex items-center justify-center text-2xl shrink-0",
                        isUnlocked ? "bg-primary/20" : "bg-muted",
                      )}
                    >
                      {isUnlocked ? achievement.icon : <Lock className="w-6 h-6 text-muted-foreground" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold truncate">{achievement.name}</h3>
                        <span
                          className={cn(
                            "text-xs px-2 py-0.5 rounded-full border",
                            getCategoryColor(achievement.category),
                          )}
                        >
                          {getCategoryLabel(achievement.category)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{achievement.description}</p>
                      <div className="mt-3 space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Pokrok</span>
                          <span className="font-medium">
                            {achievement.progress}/{achievement.requirement}
                          </span>
                        </div>
                        <Progress value={progressPercent} className="h-1.5" />
                      </div>
                      {isUnlocked && achievement.unlockedAt && (
                        <p className="text-xs text-primary mt-2">
                          Odemčeno {new Date(achievement.unlockedAt).toLocaleDateString("cs-CZ")}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}