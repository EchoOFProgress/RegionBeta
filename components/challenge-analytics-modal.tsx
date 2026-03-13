"use client"

import { useState, useMemo } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts"
import {
  Calendar,
  TrendingUp,
  Activity,
  Target,
  CheckCircle,
  Circle,
  Clock,
  Award,
  Trophy,
  Share2,
  RefreshCw,
  Flag
} from "lucide-react"
import { ProjectStatistics } from "@/components/project-statistics"
import { Challenge, Milestone } from "./challenge-module"

interface ChallengeAnalyticsData {
  summary: {
    currentStreak: number
    maxStreak: number
    completionRate: { percentage: number; completed: number; total: number }
    daysRemaining: number
    progress: number
  }
  liveMetrics: {
    period: "challenge"
    numeric?: {
      currentValue: number
      targetValue: number
      sum: number
      average: number
      goalSuccessRate: number
    }
    boolean?: {
      completed: number
      total: number
      successRate: number
    }
  }
  finalResult?: {
    completionStatus: "success" | "partial" | "failed"
    overallCompletion: number
    completedDays: number
    requiredDays: number
    averageValue?: number
    totalValue?: number
    bestPeriod?: string
    worstPeriod?: string
    highestValue?: number
    lowestValue?: number
    longestStreak: number
    shortestGap: number
    certificateText: string
  }
  dailyRecords: any[]
  chartData: any[]
}

export function ChallengeAnalyticsModal({ challenge, onConvertToHabit }: { challenge: Challenge, onConvertToHabit?: (challenge: Challenge) => void }) {
  const [timePeriod] = useState<"challenge">("challenge")

  // Calculate real analytics data based on the actual challenge data
  const analyticsData = useMemo<ChallengeAnalyticsData>(() => {
    // Calculate dates for the challenge duration
    const dates: string[] = []
    const startDate = new Date(challenge.startDate)

    for (let i = 0; i < challenge.duration; i++) {
      const date = new Date(startDate)
      date.setDate(date.getDate() + i)
      dates.push(date.toISOString().split("T")[0])
    }

    // Generate records based on actual challenge data
    const dailyRecords = dates.map(date => {
      // In a real implementation, this would come from actual tracking data
      const isCompleted = challenge.status === "completed" || challenge.currentDay > dates.indexOf(date);
      const value = challenge.goalType === "total-amount" ?
        (isCompleted ? Math.floor(challenge.duration / 2) + dates.indexOf(date) : 0) :
        undefined;

      return {
        date,
        value,
        completed: isCompleted,
        note: challenge.notes[date] || undefined
      }
    })

    // Calculate summary stats based on actual challenge data
    const completedDays = challenge.currentDay;
    const totalDays = challenge.duration;
    const completionRate = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;
    const today = new Date();
    const endDate = new Date(challenge.endDate);
    const diffTime = endDate.getTime() - today.getTime();
    const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // For numeric challenges, calculate additional stats
    let numericStats = undefined;
    if (challenge.goalType === "total-amount") {
      // Use actual challenge data
      const currentValue = challenge.dailyTasks?.filter(t => t.done).length || 0;
      const targetValue = challenge.dailyTasks?.length || challenge.duration;
      const sum = currentValue;
      const average = targetValue > 0 ? parseFloat((currentValue / targetValue).toFixed(2)) : 0;
      const goalSuccessRate = targetValue > 0 ? Math.round((currentValue / targetValue) * 100) : 0;

      numericStats = {
        currentValue,
        targetValue,
        sum,
        average,
        goalSuccessRate
      }
    }

    // For boolean challenges, calculate period stats
    let booleanStats = undefined;
    if (challenge.goalType === "daily-completion") {
      booleanStats = {
        completed: completedDays,
        total: totalDays,
        successRate: completionRate
      }
    }

    // Prepare chart data
    let chartData: any[] = [];
    if (challenge.goalType === "total-amount") {
      chartData = dailyRecords.map(record => ({
        date: record.date,
        value: record.value || 0,
        target: numericStats?.targetValue || 0,
        completed: record.completed
      }));
    } else {
      chartData = dailyRecords.map(record => ({
        date: record.date,
        completed: record.completed ? 1 : 0
      }));
    }

    // Determine completion status
    let completionStatus: "success" | "partial" | "failed" = "partial";
    if (challenge.status === "completed") {
      completionStatus = completionRate >= 80 ? "success" : "partial";
    } else if (challenge.status === "failed") {
      completionStatus = "failed";
    }

    return {
      summary: {
        currentStreak: Math.min(challenge.currentDay || 0, 7), // Simplified streak calculation
        maxStreak: Math.min(challenge.currentDay || 0, challenge.duration), // Simplified max streak
        completionRate: {
          percentage: completionRate,
          completed: completedDays,
          total: totalDays
        },
        daysRemaining: Math.max(0, daysRemaining),
        progress: completionRate
      },
      liveMetrics: {
        period: "challenge",
        numeric: numericStats,
        boolean: booleanStats
      },
      finalResult: challenge.status === "completed" || challenge.status === "failed" ? {
        completionStatus,
        overallCompletion: completionRate,
        completedDays,
        requiredDays: totalDays,
        averageValue: numericStats?.average,
        totalValue: numericStats?.sum,
        longestStreak: Math.min(challenge.currentDay || 0, 10), // Simplified
        shortestGap: 0, // Would come from actual data
        certificateText: `Congratulations on completing the "${challenge.title}" challenge!`
      } : undefined,
      dailyRecords,
      chartData
    }
  }, [challenge])

  return (
    <div className="h-full flex flex-col">
      {/* Header with consistent styling */}
      <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10 p-6 rounded-t-lg border-b">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-foreground">{challenge.title}</h2>
            <p className="text-muted-foreground mt-1 flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Challenge Analytics
            </p>
          </div>
          {challenge.status === "completed" && onConvertToHabit && (
            <Button onClick={() => onConvertToHabit(challenge)}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Convert to Habit
            </Button>
          )}
        </div>
      </div>

      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto p-6">
        <ProjectStatistics project={challenge} />
      </div>
    </div>
  )
}