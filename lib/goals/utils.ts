import { Goal, SuccessCriteria } from "./types"
import { CheckSquare, Flame, Zap, Target, Link, FileText } from "lucide-react"
import React from "react"

export function updateGoalProgress(goal: Goal): Goal {
  const totalCriteria = goal.successCriteria?.length || 0
  const completedCriteria = goal.successCriteria?.filter((c: SuccessCriteria) => c.isCompleted).length || 0
  const totalMilestones = goal.milestones?.length || 0
  const completedMilestones = goal.milestones?.filter(m => m.completed).length || 0
  const totalItems = totalCriteria + totalMilestones
  const completedItems = completedCriteria + completedMilestones
  const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0
  return { ...goal, progress, totalItems, completedItems }
}

export function generateTimelineData(goal: Goal) {
  const data: { date: string; progress: number; type: string; title?: string }[] = []
  data.push({ date: goal.createdAt, progress: 0, type: 'start' })
  if (goal.milestones) {
    goal.milestones.forEach(milestone => {
      if (milestone.completed && milestone.completedDate) {
        const estimatedProgress = Math.min(100, Math.floor(Math.random() * 40) + 60)
        data.push({ date: milestone.completedDate, progress: estimatedProgress, type: 'milestone', title: milestone.title })
      }
    })
  }
  data.push({ date: new Date().toISOString().split('T')[0], progress: goal.progress, type: 'current' })
  return data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}

export function generateMilestoneData(goal: Goal) {
  if (!goal.milestones) return []
  return goal.milestones.map(milestone => ({
    date: milestone.targetDate || new Date().toISOString().split('T')[0],
    progress: milestone.completed ? 100 : Math.floor(Math.random() * 30) + 70,
    title: milestone.title,
    completed: milestone.completed,
    type: 'milestone'
  }))
}

export function getIconForType(type: string): React.ReactElement {
  switch (type) {
    case "task": return React.createElement(CheckSquare, { className: "h-4 w-4" })
    case "habit": return React.createElement(Flame, { className: "h-4 w-4" })
    case "challenge": return React.createElement(Zap, { className: "h-4 w-4" })
    case "resource": return React.createElement(Link, { className: "h-4 w-4" })
    case "note": return React.createElement(FileText, { className: "h-4 w-4" })
    default: return React.createElement(Target, { className: "h-4 w-4" })
  }
}

export function getTypeColor(type: string): string {
  switch (type) {
    case "task": return "bg-blue-500"
    case "habit": return "bg-green-500"
    case "challenge": return "bg-purple-500"
    case "milestone": return "bg-yellow-500"
    case "dependency": return "bg-red-500"
    case "resource": return "bg-indigo-500"
    case "note": return "bg-blue-300"
    default: return "bg-gray-500"
  }
}
