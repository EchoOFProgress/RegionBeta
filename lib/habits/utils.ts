import { Habit, NumericCondition } from "./types"

export function getTodayString(): string {
  return new Date().toISOString().split("T")[0]
}

export function getConditionLabel(condition: NumericCondition): string {
  switch (condition) {
    case "at-least": return "At least"
    case "less-than": return "Less than"
    case "exactly": return "Exactly"
    default: return ""
  }
}

export function getProgressPercentage(habit: Habit): number {
  if (habit.type === "numeric" && habit.numericTarget && habit.numericTarget > 0) {
    return Math.min(100, Math.round(((habit.numericValue || 0) / habit.numericTarget) * 100))
  }
  if (habit.type === "checklist" && habit.checklistItems && habit.checklistItems.length > 0) {
    const completed = habit.checklistItems.filter(item => item.completed).length
    return Math.round((completed / habit.checklistItems.length) * 100)
  }
  return 0
}

export function calculateSuccessRate(habit: Habit): number {
  if (habit.totalCompletions === 0) return 0
  const totalDays = Math.max(habit.totalCompletions, habit.bestStreak)
  return totalDays > 0 ? Math.round((habit.totalCompletions / totalDays) * 100) : 0
}

export function calculateWeeklyCompletions(habit: Habit): number {
  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
  return habit.completionRecords.filter(r => new Date(r.date) >= oneWeekAgo).length
}

export function calculateMonthlyCompletions(habit: Habit): number {
  const oneMonthAgo = new Date()
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
  return habit.completionRecords.filter(r => new Date(r.date) >= oneMonthAgo).length
}

export function calculateAvgEnergyLevel(habit: Habit): number {
  if (!habit.completionRecords?.length) return 0
  const total = habit.completionRecords.reduce((sum, r) => sum + (r.energyLevel || 0), 0)
  return Math.round(total / habit.completionRecords.length)
}

export function calculateAvgMood(habit: Habit): number {
  if (!habit.completionRecords?.length) return 0
  const total = habit.completionRecords.reduce((sum, r) => sum + (r.mood || 0), 0)
  return Math.round(total / habit.completionRecords.length)
}

export function applyAutoReset(habits: Habit[]): Habit[] {
  const today = new Date()
  const todayString = today.toISOString().split("T")[0]

  const startOfWeek = new Date(today)
  const day = startOfWeek.getDay()
  startOfWeek.setDate(startOfWeek.getDate() - day + (day === 0 ? -6 : 1))
  const startOfWeekString = startOfWeek.toISOString().split("T")[0]

  const startOfMonthString = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split("T")[0]

  return habits.map(habit => {
    if (habit.lastCompleted === todayString) return habit

    const resetHabit = (h: Habit): Habit => {
      if (h.type === "boolean") return { ...h, completedToday: false }
      if (h.type === "numeric") return { ...h, numericValue: 0 }
      if (h.type === "checklist" && h.checklistItems) {
        return { ...h, checklistItems: h.checklistItems.map(i => ({ ...i, completed: false })) }
      }
      return h
    }

    if (habit.resetSchedule === "daily") return resetHabit(habit)
    if (habit.resetSchedule === "weekly") {
      if (!habit.lastCompleted || habit.lastCompleted < startOfWeekString) return resetHabit(habit)
    }
    if (habit.resetSchedule === "monthly") {
      if (!habit.lastCompleted || habit.lastCompleted < startOfMonthString) return resetHabit(habit)
    }
    return habit
  })
}
