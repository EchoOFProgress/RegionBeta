export type Goal = {
  id: string
  title: string
  description: string
  createdAt: string
  targetDate?: string
  linkedTasks: string[]
  linkedHabits: string[]
  linkedChallenges: string[]
  completed?: boolean
  archived?: boolean
}
