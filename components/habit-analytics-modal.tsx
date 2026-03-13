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
  Circle 
} from "lucide-react"

type HabitType = "boolean" | "numeric" | "checklist"
type TimePeriod = "day" | "week" | "month" | "year"

interface Habit {
  id: string
  name: string
  streak: number
  bestStreak: number
  totalCompletions: number
  lastCompleted: string | null
  completedToday: boolean
  description?: string
  categories?: string[]
  type: HabitType
  numericValue?: number
  numericCondition?: "at-least" | "less-than" | "exactly"
  numericTarget?: number
  reminders?: string[]
  frequency?: "daily" | "weekly" | "monthly" | "custom"
  customDays?: number[]
  checklistItems?: { id: string; name: string; completed: boolean }[]
  resetSchedule?: "daily" | "weekly" | "monthly"
  color?: string
  icon?: string
  timeWindow?: { from: string; to: string }
  completionRecords: HabitCompletionRecord[] // Historical completion data
  weeklyCompletions?: number // Number of completions in the current week
  monthlyCompletions?: number // Number of completions in the current month
  successRate?: number // Overall success rate percentage
}

interface HabitCompletionRecord {
  date: string // YYYY-MM-DD
  value?: number // For numeric habits
  energyLevel?: number // Energy level (1-10) used to complete
  mood?: number // Mood rating (1-5)
  note?: string
}

interface DailyRecord {
  date: string
  value?: number
  completed: boolean
  note?: string
  energyLevel?: number
  mood?: number
}

interface AnalyticsData {
  summary: {
    currentStreak: number
    maxStreak: number
    successRate: { percentage: number; completed: number; total: number }
    activeDays: number
    thisWeekCompletions: number
    thisMonthCompletions: number
    avgEnergyLevel: number
    avgMood: number
  }
  timeStats: {
    period: TimePeriod
    numeric?: {
      sum: number
      average: number
      min: number
      max: number
      goalSuccessRate: number
    }
    boolean?: {
      completed: number
      missed: number
      successRate: number
      bestPeriod?: string
    }
  }
  dailyRecords: DailyRecord[]
  chartData: any[]
}

export function HabitAnalyticsModal({ habit }: { habit: Habit }) {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("week")
  
  // Helper functions to calculate statistics
  const calculateWeeklyCompletions = (habit: Habit) => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    return habit.completionRecords.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate >= oneWeekAgo;
    }).length;
  };
  
  const calculateMonthlyCompletions = (habit: Habit) => {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    
    return habit.completionRecords.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate >= oneMonthAgo;
    }).length;
  };
  
  // Calculate real analytics data based on the actual habit data
  const analyticsData = useMemo<AnalyticsData>(() => {
    // Generate dates based on time period
    const dates = []
    const today = new Date()
    
    switch (timePeriod) {
      case "day":
        dates.push(today.toISOString().split("T")[0])
        break
      case "week":
        for (let i = 6; i >= 0; i--) {
          const date = new Date(today)
          date.setDate(date.getDate() - i)
          dates.push(date.toISOString().split("T")[0])
        }
        break
      case "month":
        for (let i = 29; i >= 0; i--) {
          const date = new Date(today)
          date.setDate(date.getDate() - i)
          dates.push(date.toISOString().split("T")[0])
        }
        break
      case "year":
        // Simplified - show 12 months
        for (let i = 11; i >= 0; i--) {
          const date = new Date(today.getFullYear(), today.getMonth() - i, 1)
          dates.push(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`)
        }
        break
    }
    
    // Generate records based on actual completion records from the habit
    const dailyRecords: DailyRecord[] = dates.map(date => {
      // Find the record for this date in the habit's completion records
      const record = habit.completionRecords.find(r => r.date === date)
      
      if (record) {
        return {
          date,
          value: record.value,
          completed: true,
          note: record.note,
          energyLevel: record.energyLevel,
          mood: record.mood
        }
      } else {
        return {
          date,
          value: undefined,
          completed: false,
          note: undefined,
          energyLevel: undefined,
          mood: undefined
        }
      }
    })
    
    // Calculate summary stats based on actual completion records
    const completedDays = habit.completionRecords.length
    const totalDays = dates.length
    const successRate = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0
    
    // Calculate additional statistics from completion records
    const energyLevels = habit.completionRecords
      .filter(record => record.energyLevel !== undefined)
      .map(record => record.energyLevel as number)
    const avgEnergy = energyLevels.length > 0 
      ? Math.round(energyLevels.reduce((sum, val) => sum + val, 0) / energyLevels.length)
      : 0
    
    const moods = habit.completionRecords
      .filter(record => record.mood !== undefined)
      .map(record => record.mood as number)
    const avgMood = moods.length > 0 
      ? Math.round(moods.reduce((sum, val) => sum + val, 0) / moods.length)
      : 0
    
    // For numeric habits, calculate additional stats
    let numericStats = undefined
    if (habit.type === "numeric" && habit.numericTarget) {
      const values = habit.completionRecords
        .filter(record => record.value !== undefined)
        .map(record => record.value as number)
      
      if (values.length > 0) {
        const sum = values.reduce((acc, val) => acc + val, 0)
        const average = sum / values.length
        const min = Math.min(...values)
        const max = Math.max(...values)
        
        // Calculate goal success rate based on records
        const targetMetCount = values.filter(val => {
          if (habit.numericCondition === "at-least") return val >= (habit.numericTarget || 0)
          if (habit.numericCondition === "less-than") return val < (habit.numericTarget || 0)
          if (habit.numericCondition === "exactly") return val === (habit.numericTarget || 0)
          return false
        }).length
        const goalSuccessRate = values.length > 0 ? Math.round((targetMetCount / values.length) * 100) : 0
        
        numericStats = {
          sum,
          average,
          min,
          max,
          goalSuccessRate
        }
      }
    }
    
    // For boolean habits, calculate period stats
    let booleanStats = undefined
    if (habit.type === "boolean") {
      const missedDays = totalDays - completedDays
      booleanStats = {
        completed: completedDays,
        missed: missedDays,
        successRate
      }
    }
    
    // Prepare chart data
    let chartData = []
    if (habit.type === "numeric") {
      chartData = dailyRecords.map(record => ({
        date: record.date,
        value: record.value || 0,
        goal: habit.numericTarget || 0,
        completed: record.completed ? 1 : 0,
        energyLevel: record.energyLevel,
        mood: record.mood
      }))
    } else {
      chartData = dailyRecords.map(record => ({
        date: record.date,
        completed: record.completed ? 1 : 0,
        energyLevel: record.energyLevel,
        mood: record.mood
      }))
    }
    
    return {
      summary: {
        currentStreak: habit.streak,
        maxStreak: habit.bestStreak,
        successRate: {
          percentage: successRate,
          completed: completedDays,
          total: totalDays
        },
        activeDays: totalDays,
        thisWeekCompletions: calculateWeeklyCompletions(habit),
        thisMonthCompletions: calculateMonthlyCompletions(habit),
        avgEnergyLevel: avgEnergy,
        avgMood: avgMood
      },
      timeStats: {
        period: timePeriod,
        numeric: numericStats,
        boolean: booleanStats
      },
      dailyRecords,
      chartData
    }
  }, [habit, timePeriod])
  
  return (
    <div className="h-full flex flex-col">
      {/* Header with consistent styling */}
      <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10 p-6 rounded-t-lg border-b">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-foreground">{habit.name}</h2>
            <p className="text-muted-foreground mt-1 flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Habit Analytics
            </p>
          </div>
          <Select value={timePeriod} onValueChange={(value) => setTimePeriod(value as TimePeriod)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Day</SelectItem>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="month">Month</SelectItem>
              <SelectItem value="year">Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Quick Summary */}
        <Card className="mb-6 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Activity className="h-5 w-5 text-primary" />
              Performance Summary
            </CardTitle>
            <CardDescription>Habit performance metrics</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg border bg-card">
              <p className="text-sm text-muted-foreground">Current Streak</p>
              <p className="text-2xl font-bold text-foreground">
                {analyticsData.summary.currentStreak} <span className="text-base">days</span>
              </p>
            </div>
            <div className="p-4 rounded-lg border bg-card">
              <p className="text-sm text-muted-foreground">Max Streak</p>
              <p className="text-2xl font-bold text-foreground">
                {analyticsData.summary.maxStreak} <span className="text-base">days</span>
              </p>
            </div>
            <div className="p-4 rounded-lg border bg-card">
              <p className="text-sm text-muted-foreground">Success Rate</p>
              <p className="text-2xl font-bold text-foreground">
                {analyticsData.summary.successRate.percentage}% 
                <span className="text-sm font-normal block text-muted-foreground">
                  ({analyticsData.summary.successRate.completed} / {analyticsData.summary.successRate.total})
                </span>
              </p>
            </div>
            <div className="p-4 rounded-lg border bg-card">
              <p className="text-sm text-muted-foreground">Active Days</p>
              <p className="text-2xl font-bold text-foreground">{analyticsData.summary.activeDays}</p>
            </div>
            <div className="p-4 rounded-lg border bg-card">
              <p className="text-sm text-muted-foreground">This Week</p>
              <p className="text-2xl font-bold text-foreground">{analyticsData.summary.thisWeekCompletions}</p>
            </div>
            <div className="p-4 rounded-lg border bg-card">
              <p className="text-sm text-muted-foreground">This Month</p>
              <p className="text-2xl font-bold text-foreground">{analyticsData.summary.thisMonthCompletions}</p>
            </div>
            <div className="p-4 rounded-lg border bg-card">
              <p className="text-sm text-muted-foreground">Avg Energy</p>
              <p className="text-2xl font-bold text-foreground">{analyticsData.summary.avgEnergyLevel}/10</p>
            </div>
            <div className="p-4 rounded-lg border bg-card">
              <p className="text-sm text-muted-foreground">Avg Mood</p>
              <p className="text-2xl font-bold text-foreground">{analyticsData.summary.avgMood}/5</p>
            </div>
          </CardContent>
        </Card>
        
        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Progress Chart */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Progress Visualization
              </CardTitle>
              <CardDescription>Daily progress over time</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                {habit.type === "numeric" ? (
                  <BarChart data={analyticsData.chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8884d8" name="Actual Value" />
                    <Bar dataKey="goal" fill="#82ca9d" name="Target Value" />
                  </BarChart>
                ) : (
                  <LineChart data={analyticsData.chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="completed" 
                      stroke="#8884d8" 
                      activeDot={{ r: 8 }} 
                      name="Completed"
                    />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          {/* Completion Heatmap */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Completion History
              </CardTitle>
              <CardDescription>Recent activity pattern</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: 28 }).map((_, dayIndex) => {
                  // Get the date for this day (working backwards from today)
                  const date = new Date()
                  date.setDate(date.getDate() - (27 - dayIndex))
                  const dateString = date.toISOString().split("T")[0]
                  
                  // Find if this day was completed
                  const record = analyticsData.dailyRecords.find((r: DailyRecord) => r.date === dateString)
                  const isCompleted = record ? record.completed : false
                  
                  return (
                    <div 
                      key={dayIndex}
                      className={`aspect-square rounded-sm ${
                        isCompleted 
                          ? 'bg-primary hover:bg-primary/80' 
                          : 'bg-muted hover:bg-muted/80'
                      }`}
                      title={`${dateString}: ${isCompleted ? 'Completed' : 'Not completed'}`}
                    />
                  )
                })}
              </div>
              <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-muted rounded-sm"></div>
                  <span>Not completed</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-primary rounded-sm"></div>
                  <span>Completed</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Detailed Stats */}
        {habit.type === "numeric" && analyticsData.timeStats.numeric && (
          <Card className="mb-6 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Numeric Statistics
              </CardTitle>
              <CardDescription>Detailed metrics for numeric habits</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg border bg-card">
                <p className="text-sm text-muted-foreground">Sum</p>
                <p className="text-2xl font-bold text-foreground">{analyticsData.timeStats.numeric.sum}</p>
              </div>
              <div className="p-4 rounded-lg border bg-card">
                <p className="text-sm text-muted-foreground">Average</p>
                <p className="text-2xl font-bold text-foreground">{analyticsData.timeStats.numeric.average}</p>
              </div>
              <div className="p-4 rounded-lg border bg-card">
                <p className="text-sm text-muted-foreground">Minimum</p>
                <p className="text-2xl font-bold text-foreground">{analyticsData.timeStats.numeric.min}</p>
              </div>
              <div className="p-4 rounded-lg border bg-card">
                <p className="text-sm text-muted-foreground">Maximum</p>
                <p className="text-2xl font-bold text-foreground">{analyticsData.timeStats.numeric.max}</p>
              </div>
              <div className="p-4 rounded-lg border bg-card md:col-span-4">
                <p className="text-sm text-muted-foreground">Goal Success Rate</p>
                <p className="text-2xl font-bold text-foreground">{analyticsData.timeStats.numeric.goalSuccessRate}%</p>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Daily Records */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Daily Records
            </CardTitle>
            <CardDescription>Recent activity log</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {analyticsData.dailyRecords.slice(0, 10).map((record: DailyRecord, index: number) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      record.completed ? 'bg-primary' : 'bg-muted'
                    }`}></div>
                    <span className="font-medium">{record.date}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    {habit.type === "numeric" && record.value !== undefined && (
                      <span className="text-sm font-medium">
                        {record.value} {habit.numericTarget && (
                          <span className={`ml-1 ${
                            record.value >= habit.numericTarget 
                              ? 'text-green-600' : 'text-red-600'
                          }`}>
                            ({record.value >= habit.numericTarget ? '✓' : '✗'})
                          </span>
                        )}
                      </span>
                    )}
                    {record.note && (
                      <span className="text-sm text-muted-foreground italic">
                        "{record.note}"
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}