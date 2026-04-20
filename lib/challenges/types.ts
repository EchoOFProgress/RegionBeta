export type ChallengeStatus = "upcoming" | "active" | "completed" | "failed"

export type ChallengeGoalType = "daily-completion" | "total-amount" | "checklist" | "points"

export type DailyTask = {
  day: number
  task: string
  done: boolean
}

export interface HabitCompletionRecord {
  date: string
  value?: number
  energyLevel?: number
  mood?: number
  note?: string
}

export interface Habit {
  id: string
  name: string
  streak: number
  bestStreak: number
  totalCompletions: number
  lastCompleted: string | null
  completedToday: boolean
  description?: string
  categories?: string[]
  type: 'boolean' | 'numeric' | 'checklist'
  numericValue?: number
  numericCondition?: 'at-least' | 'less-than' | 'exactly'
  numericTarget?: number
  reminders?: string[]
  frequency?: 'daily' | 'weekly' | 'monthly' | 'custom'
  customDays?: number[]
  checklistItems?: { id: string; name: string; completed: boolean }[]
  resetSchedule?: "daily" | "weekly" | "monthly"
  color?: string
  icon?: string
  timeWindow?: { from: string; to: string }
  completionRecords: HabitCompletionRecord[]
  weeklyCompletions?: number
  monthlyCompletions?: number
  successRate?: number
}

export type Milestone = {
  id: string
  title: string
  description: string
  targetValue: number
  currentValue: number
  achieved: boolean
  achievedDate?: string
  color: string
}

export type Challenge = {
  id: string
  title: string
  description: string
  duration: number
  currentDay: number
  status: ChallengeStatus
  startDate: string
  endDate: string
  lastCheckedIn: string | null
  categories?: string[]
  goalType: ChallengeGoalType
  failureMode: "hard" | "soft" | "retry-limit"
  maxFailures?: number
  currentFailures: number
  notes: { [date: string]: string }
  difficulty: number
  color: string
  icon: string
  archived: boolean
  dailyTasks?: DailyTask[]
  totalAmount?: number
  currentAmount?: number
  dailyTarget?: number
  dailyProgress?: number[]
  dailyNotes?: { [date: string]: string }
  dailyEnergy?: { [date: string]: number }
  linkedGoalId?: string
  currentStreak?: number
  bestStreak?: number
  lastCompletedDate?: string
  completionRecords?: { date: string; amount: number; energyLevel?: number; note?: string }[]
  milestones?: Milestone[]
}
