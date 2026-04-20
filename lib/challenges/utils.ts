import { Challenge, ChallengeStatus } from "./types"
import React from "react"

export function getTodayString(): string {
  return new Date().toISOString().split("T")[0]
}

export function calculateEndDate(startDate: string, duration: number): string {
  const start = new Date(startDate)
  const end = new Date(start)
  end.setDate(end.getDate() + duration)
  return end.toISOString().split("T")[0]
}

export function getProgressPercentage(challenge: Challenge): number {
  if (challenge.duration <= 0) return 0
  return Math.round((challenge.currentDay / challenge.duration) * 100)
}

export function getDaysUntilStart(challenge: Challenge): number {
  const diffTime = new Date(challenge.startDate).getTime() - new Date().getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

export function getDaysRemaining(challenge: Challenge): number {
  const diffTime = new Date(challenge.endDate).getTime() - new Date().getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

export function getStatusColor(status: ChallengeStatus): string {
  switch (status) {
    case "upcoming": return "bg-blue-100 text-blue-600"
    case "active": return "bg-green-100 text-green-600"
    case "completed": return "bg-purple-100 text-purple-600"
    case "failed": return "bg-red-100 text-red-600"
    default: return "bg-gray-100 text-gray-600"
  }
}

export function getDailyPaceNeeded(challenge: Challenge) {
  const totalDuration = challenge.duration
  const daysSinceStart = Math.ceil((new Date().getTime() - new Date(challenge.startDate).getTime()) / (1000 * 60 * 60 * 24))
  const totalGoal = 100
  const dailyTarget = totalGoal / totalDuration
  const expectedCompleted = daysSinceStart > 0 ? daysSinceStart * dailyTarget : 0
  const actualProgress = challenge.currentDay * dailyTarget
  return {
    dailyTarget,
    expectedCompleted,
    actualProgress,
    daysBehind: expectedCompleted > actualProgress ? expectedCompleted - actualProgress : 0,
    daysAhead: actualProgress > expectedCompleted ? actualProgress - expectedCompleted : 0,
    pace: expectedCompleted > 0 ? (actualProgress / expectedCompleted) * 100 : 100
  }
}

export function getPaceStatus(challenge: Challenge): 'ahead' | 'behind' | 'on track' {
  const pace = getDailyPaceNeeded(challenge)
  if (pace.pace > 110) return 'ahead'
  if (pace.pace < 90) return 'behind'
  return 'on track'
}

export function getPaceColor(challenge: Challenge): string {
  const status = getPaceStatus(challenge)
  if (status === 'ahead') return 'text-green-600'
  if (status === 'behind') return 'text-red-600'
  return 'text-blue-600'
}

export function getPaceIcon(challenge: Challenge): string {
  const status = getPaceStatus(challenge)
  if (status === 'ahead') return '📈'
  if (status === 'behind') return '📉'
  return '➡️'
}

export function getCompletionRate(challenge: Challenge): number {
  if (!challenge.dailyProgress) return 0
  const completedDays = challenge.dailyProgress.filter(d => d > 0).length
  return challenge.dailyProgress.length > 0 ? Math.round((completedDays / challenge.dailyProgress.length) * 100) : 0
}
