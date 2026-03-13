// Harada Method Types

export interface User {
  id: string
  name: string
  email: string
  createdAt: string
  avatar?: string
}

export interface SelfRelianceAnswer {
  questionId: number
  score: number // 1-5
}

export interface SelfRelianceAssessment {
  id: string
  userId: string
  answers: SelfRelianceAnswer[]
  categories: {
    mentalAttitude: number
    healthManagement: number
    livingAttitude: number
    skills: number
  }
  totalScore: number
  completedAt: string
}

export interface LongTermGoal {
  id: string
  userId: string
  targetDate: string
  goalDescription: string
  motivation: string // Why this goal?
  currentState: string
  desiredState: string
  obstacles: string[]
  resources: string[]
  supporters: string[]
  dailyHabits: string[]
  weeklyMilestones: string[]
  monthlyTargets: string[]
  createdAt: string
  updatedAt: string
}

export interface BasicGoal {
  id: string
  text: string
  category: "mental" | "health" | "skill" | "relationship" | "financial" | "lifestyle" | "learning" | "other"
}

export interface ActionTask {
  id: string
  basicGoalId: string
  text: string
  completed: boolean
  dueDate?: string
}

export interface Chart64 {
  id: string
  userId: string
  longTermGoalId: string
  centralGoal: string
  basicGoals: BasicGoal[] // 8 goals
  actionTasks: ActionTask[] // 64 tasks (8 per basic goal)
  createdAt: string
  updatedAt: string
}

export interface RoutineTask {
  id: string
  name: string
  category: "morning" | "afternoon" | "evening"
  time?: string
  isCustom: boolean
}

export interface RoutineCheckEntry {
  date: string
  taskId: string
  completed: boolean
  note?: string
}

export interface RoutineCheckSheet {
  id: string
  userId: string
  tasks: RoutineTask[]
  entries: RoutineCheckEntry[]
  createdAt: string
}

export interface DiaryEntry {
  id: string
  userId: string
  date: string
  mood: 1 | 2 | 3 | 4 | 5
  achievements: string[]
  challenges: string[]
  gratitude: string[]
  tomorrowGoals: string[]
  reflection: string
  energyLevel: number
  productivityScore: number
  createdAt: string
}

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  unlockedAt?: string
  category: "streak" | "completion" | "milestone" | "special"
  requirement: number
  progress: number
}

export interface UserStats {
  totalDays: number
  currentStreak: number
  longestStreak: number
  tasksCompleted: number
  diaryEntries: number
  assessmentsCompleted: number
  goalsAchieved: number
  points: number
  level: number
}