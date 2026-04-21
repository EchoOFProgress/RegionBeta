export type HabitType = "boolean" | "numeric" | "checklist"
export type NumericCondition = "at-least" | "less-than" | "exactly"
export type FrequencyType = "daily" | "weekly" | "monthly" | "custom"

export type ChecklistItem = {
  id: string
  name: string
  completed: boolean
}

export type DailyLog = {
  date: string
  note: string
}

export type HabitCompletionRecord = {
  date: string
  value?: number
  note?: string
}

export type Habit = {
  id: string
  name: string
  streak: number
  bestStreak: number
  totalCompletions: number
  lastCompleted: string | null
  completedToday: boolean
  description?: string
  type: HabitType
  numericValue?: number
  numericCondition?: NumericCondition
  numericTarget?: number
  reminders?: string[]
  frequency?: FrequencyType
  customDays?: number[]
  checklistItems?: ChecklistItem[]
  resetSchedule?: "daily" | "weekly" | "monthly"
  color?: string
  icon?: string
  timeWindow?: {
    from: string
    to: string
  }
  completionRecords: HabitCompletionRecord[]
  weeklyCompletions?: number
  monthlyCompletions?: number
  successRate?: number
  archived?: boolean
}
