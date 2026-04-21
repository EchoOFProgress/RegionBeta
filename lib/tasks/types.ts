export type TaskType = "boolean" | "numeric"
export type NumericCondition = "at-least" | "less-than" | "exactly"

export type Task = {
  id: string
  title: string
  priority: number
  completed: boolean
  type: TaskType
  numericValue?: number
  numericCondition?: NumericCondition
  numericTarget?: number
  description?: string
  dueDate?: string
  timeEstimate?: number
  createdAt?: string
  completedAt?: string
  linkedGoalId?: string
  dependencies?: string[]
  timeBlockStart?: string
  timeBlockEnd?: string
  timeBlockDate?: string
  tags?: string[]
  isRecurring?: boolean
  recurrencePattern?: 'daily' | 'weekly' | 'monthly' | 'yearly'
  recurrenceEndDate?: string
  recurrenceInterval?: number
  streak?: number
  bestStreak?: number
  lastCompleted?: string
  completionRecords?: { date: string; value?: number; note?: string }[]
  archived?: boolean
}

export type PresetTask = {
  title: string
  priority: number
  description: string
  timeEstimate?: number
}
