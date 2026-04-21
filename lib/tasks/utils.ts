import { Task, NumericCondition } from "./types"

export function isTaskOverdue(task: Task): boolean {
  if (!task.dueDate) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const dueDate = new Date(task.dueDate)
  dueDate.setHours(0, 0, 0, 0)
  return dueDate < today && !task.completed
}

export function getConditionLabel(condition: NumericCondition): string {
  switch (condition) {
    case "at-least": return "At least"
    case "less-than": return "Less than"
    case "exactly": return "Exactly"
    default: return ""
  }
}

export function calculateNewStreak(task: Task, today: string): number {
  const lastCompletedDate = task.lastCompleted
  if (!lastCompletedDate) return 1
  const lastCompletion = new Date(lastCompletedDate)
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  if (lastCompletion.toISOString().split('T')[0] === yesterday.toISOString().split('T')[0]) {
    return (task.streak || 0) + 1
  }
  if (lastCompletedDate === today) return task.streak || 0
  return 1
}

export function sortTasks(
  tasks: Task[],
  sortBy: 'priority' | 'dueDate' | 'created' | 'manual'
): Task[] {
  if (sortBy === 'manual') return tasks
  return [...tasks].sort((a, b) => {
    if (sortBy === 'priority') return b.priority - a.priority
    if (sortBy === 'dueDate') {
      if (!a.dueDate && !b.dueDate) return 0
      if (!a.dueDate) return 1
      if (!b.dueDate) return -1
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    }
    if (sortBy === 'created') {
      if (!a.createdAt && !b.createdAt) return 0
      if (!a.createdAt) return 1
      if (!b.createdAt) return -1
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    }
    return 0
  })
}
export function getProgressPercentage(task: Task): number {
  if (task.type === "numeric" && task.numericTarget && task.numericTarget > 0) {
    return Math.min(100, Math.round(((task.numericValue || 0) / task.numericTarget) * 100))
  }
  return task.completed ? 100 : 0
}
